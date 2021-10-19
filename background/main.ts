import { browser } from "webextension-polyfill-ts"
import { alias, wrapStore } from "webext-redux"
import { configureStore, isPlain, Middleware } from "@reduxjs/toolkit"
import devToolsEnhancer from "remote-redux-devtools"
import ethers from "ethers"

import { ETHEREUM } from "./constants/networks"
import { decodeJSON, encodeJSON } from "./lib/utils"
import logger from "./lib/logger"
import { ethersTxFromTx } from "./services/chain/utils"

import {
  ChainService,
  IndexingService,
  KeyringService,
  LedgerBridgeService,
  PreferenceService,
  ServiceCreatorFunction,
} from "./services"

import {
  ConfirmedEVMTransaction,
  SignedEVMTransaction,
  KeyringTypes,
} from "./types"

import rootReducer from "./redux-slices"
import {
  loadAccount,
  transactionConfirmed,
  transactionSeen,
  blockSeen,
  updateAccountBalance,
  emitter as accountSliceEmitter,
} from "./redux-slices/accounts"
import { assetsLoaded, newPricePoint } from "./redux-slices/assets"
import {
  emitter as keyringSliceEmitter,
  updateKeyrings,
} from "./redux-slices/keyrings"
import { emitter as transactionSliceEmitter } from "./redux-slices/transaction"
import { allAliases } from "./redux-slices/utils"
import BaseService from "./services/base"

// This sanitizer runs on store and action data before serializing for remote
// redux devtools. The goal is to end up with an object that is direcetly
// JSON-serializable and deserializable; the remote end will display the
// resulting objects without additional processing or decoding logic.
const devToolsSanitizer = (input: unknown) => {
  switch (typeof input) {
    // We can make use of encodeJSON instead of recursively looping through
    // the input
    case "bigint":
    case "object":
      return JSON.parse(encodeJSON(input))
    // We only need to sanitize bigints and objects that may or may not contain
    // them.
    default:
      return input
  }
}

const reduxCache: Middleware = (store) => (next) => (action) => {
  const result = next(action)
  const state = store.getState()

  if (process.env.WRITE_REDUX_CACHE === "true") {
    // Browser extension storage supports JSON natively, despite that we have
    // to stringify to preserve BigInts
    browser.storage.local.set({ state: encodeJSON(state) })
  }

  return result
}

// Declared out here so ReduxStoreType can be used in Main.store type
// declaration.
const initializeStore = (startupState = {}) =>
  configureStore({
    preloadedState: startupState,
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware({
        serializableCheck: {
          isSerializable: (value: unknown) =>
            isPlain(value) || typeof value === "bigint",
        },
      })

      // It might be tempting to use an array with `...` destructuring, but
      // unfortunately this fails to preserve important type information from
      // `getDefaultMiddleware`. `push` and `pull` preserve the type
      // information in `getDefaultMiddleware`, including adjustments to the
      // dispatch function type, but as a tradeoff nothing added this way can
      // further modify the type signature. For now, that's fine, as these
      // middlewares don't change acceptable dispatch types.
      //
      // Process aliases before all other middleware, and cache the redux store
      // after all middleware gets a chance to run.
      middleware.unshift(alias(allAliases))
      middleware.push(reduxCache)

      return middleware
    },
    devTools: false,
    enhancers: [
      devToolsEnhancer({
        hostname: "localhost",
        port: 8000,
        realtime: true,
        actionSanitizer: devToolsSanitizer,
        stateSanitizer: devToolsSanitizer,
      }),
    ],
  })

type ReduxStoreType = ReturnType<typeof initializeStore>

// TODO Rename ReduxService or CoordinationService, move to services/, etc.
export default class Main extends BaseService<never> {
  /**
   * The redux store for the wallet core. Note that the redux store is used to
   * render the UI (via webext-redux), but it is _not_ the source of truth.
   * Services interact with the various external and internal components and
   * create persisted state, and the redux store is simply a view onto those
   * pieces of canonical state.
   */
  store: ReduxStoreType

  static create: ServiceCreatorFunction<never, Main, []> = async () => {
    const preferenceService = PreferenceService.create()
    const chainService = ChainService.create(preferenceService)
    const indexingService = IndexingService.create(
      preferenceService,
      chainService
    )
    const keyringService = KeyringService.create()
    const ledgerBridgeService = LedgerBridgeService.create(chainService)

    return new this(
      await preferenceService,
      await chainService,
      await indexingService,
      await keyringService,
      await ledgerBridgeService
    )
  }

  private constructor(
    /**
     * A promise to the preference service, a dependency for most other services.
     * The promise will be resolved when the service is initialized.
     */
    private preferenceService: PreferenceService,
    /**
     * A promise to the chain service, keeping track of base asset balances,
     * transactions, and network status. The promise will be resolved when the
     * service is initialized.
     */
    private chainService: ChainService,
    /**
     * A promise to the indexing service, keeping track of token balances and
     * prices. The promise will be resolved when the service is initialized.
     */
    private indexingService: IndexingService,
    /**
     * A promise to the keyring service, which stores key material, derives
     * accounts, and signs messagees and transactions. The promise will be
     * resolved when the service is initialized.
     */
    private keyringService: KeyringService,
    /**
     * A promise to the Ledger bridge service, responsible for communicating
     * with Ledger devices over WebUSB. The promise will be resolved when the
     * service is initialized.
     */
    private ledgerBridgeService: LedgerBridgeService
  ) {
    super()

    // Setting READ_REDUX_CACHE to false will start the extension with an empty
    // initial state, which can be useful for development
    if (process.env.READ_REDUX_CACHE === "true") {
      browser.storage.local.get("state").then((saved) => {
        this.initializeRedux(saved.state ? decodeJSON(saved.state) : {})
      })
    } else {
      this.initializeRedux()
    }
  }

  protected async internalStartService(): Promise<void> {
    await super.internalStartService()

    this.indexingService.started().then(async () => this.chainService.started())

    await Promise.all([
      this.preferenceService.startService(),
      this.chainService.startService(),
      this.indexingService.startService(),
      this.keyringService.startService(),
      this.ledgerBridgeService.startService(),
    ])
  }

  protected async internalStopService(): Promise<void> {
    await Promise.all([
      this.preferenceService.stopService(),
      this.chainService.stopService(),
      this.indexingService.stopService(),
      this.keyringService.stopService(),
      this.ledgerBridgeService.stopService(),
    ])

    await super.internalStopService()
  }

  async initializeRedux(startupState?: unknown): Promise<void> {
    // Start up the redux store and set it up for proxying.
    this.store = initializeStore(startupState)
    wrapStore(this.store, {
      serializer: encodeJSON,
      deserializer: decodeJSON,
    })

    this.connectIndexingService()
    this.connectKeyringService()
    await this.connectChainService()
  }

  async connectChainService(): Promise<void> {
    // Wire up chain service to account slice.
    this.chainService.emitter.on("accountBalance", (accountWithBalance) => {
      // The first account balance update will transition the account to loading.
      this.store.dispatch(updateAccountBalance(accountWithBalance))
    })
    this.chainService.emitter.on("transaction", (transaction) => {
      if (
        transaction.blockHash &&
        (transaction as ConfirmedEVMTransaction).gas !== undefined
      ) {
        this.store.dispatch(
          transactionConfirmed(transaction as ConfirmedEVMTransaction)
        )
      } else {
        this.store.dispatch(transactionSeen(transaction))
      }
    })
    this.chainService.emitter.on("block", (block) => {
      this.store.dispatch(blockSeen(block))
    })
    accountSliceEmitter.on("addAccount", async (accountNetwork) => {
      await this.chainService.addAccountToTrack(accountNetwork)
    })

    transactionSliceEmitter.on("updateOptions", async (options) => {
      // Basic transaction construction based on the provided options, with extra data from the chain service
      const transaction = {
        to: options.to,
        value: options.value,
        gasLimit: options.gasLimit,
        maxFeePerGas: options.maxFeePerGas,
        maxPriorityFeePerGas: options.maxPriorityFeePerGas,
        input: "",
        type: 2 as const,
        chainID: "1",
        nonce:
          await this.chainService.pollingProviders.ethereum.getTransactionCount(
            options.from,
            "latest"
          ),
        gasPrice:
          await this.chainService.pollingProviders.ethereum.getGasPrice(),
      }

      await this.keyringService.signTransaction(options.from, transaction)
    })

    // Set up initial state.
    const existingAccounts = await this.chainService.getAccountsToTrack()
    existingAccounts.forEach((accountNetwork) => {
      // Mark as loading and wire things up.
      this.store.dispatch(loadAccount(accountNetwork.account))

      // Force a refresh of the account balance to populate the store.
      this.chainService.getLatestBaseAccountBalance(accountNetwork)
    })
  }

  async connectIndexingService(): Promise<void> {
    this.indexingService.emitter.on("accountBalance", (accountWithBalance) => {
      this.store.dispatch(updateAccountBalance(accountWithBalance))
    })

    this.indexingService.emitter.on("assets", (assets) => {
      this.store.dispatch(assetsLoaded(assets))
    })

    this.indexingService.emitter.on("price", (pricePoint) => {
      this.store.dispatch(newPricePoint(pricePoint))
    })
  }

  async connectKeyringService(): Promise<void> {
    this.keyringService.emitter.on("keyrings", (keyrings) => {
      this.store.dispatch(updateKeyrings(keyrings))
    })

    this.keyringService.emitter.on("address", (address) => {
      this.chainService.addAccountToTrack({
        account: address,
        // TODO support other networks
        network: ETHEREUM,
      })
    })

    this.keyringService.emitter.on(
      "signedTx",
      async (transaction: SignedEVMTransaction) => {
        const ethersTx = ethersTxFromTx(transaction)
        const serializedTx = ethers.utils.serializeTransaction(ethersTx, {
          r: transaction.r,
          s: transaction.s,
          v: transaction.v,
        })

        const response =
          await this.chainService.pollingProviders.ethereum.sendTransaction(
            serializedTx
          )

        logger.log("Transaction broadcast:")
        logger.log(response)
      }
    )

    keyringSliceEmitter.on("generateNewKeyring", async () => {
      // TODO move unlocking to a reasonable place in the initialization flow
      await this.keyringService.generateNewKeyring(
        KeyringTypes.mnemonicBIP39S256
      )
    })

    keyringSliceEmitter.on("importLegacyKeyring", async ({ mnemonic }) => {
      await this.keyringService.importLegacyKeyring(mnemonic)
    })
  }
}

import { browser, Runtime } from "webextension-polyfill-ts"

import ChainService from "../chain"
import BaseService from "../base"
import { ServiceCreatorFunction, ServiceLifecycleEvents } from "../types"

type Events = ServiceLifecycleEvents

/**
 * LedgerBridgeService responds to any instances of the Ledger WebUSB bridge
 * page open in a tab, returning information from WebUSB-connected Ledger
 * devices and requesting signatures and device status when necessary.
 *
 * Every time a new tab with the bridge opens, any already connected bridge tab
 * is removed.
 */
export default class LedgerBridgeService extends BaseService<Events> {
  private bridgePort: Runtime.Port | null

  static create: ServiceCreatorFunction<
    Events,
    LedgerBridgeService,
    [Promise<ChainService>]
  > = async (chainService) => {
    return new this(await chainService)
  }

  private constructor(private chainService: ChainService) {
    super({})
    this.bridgePort = null
  }

  async internalStartService(): Promise<void> {
    await super.internalStartService()

    browser.runtime.onConnect.addListener(async (port) => {
      if (port.name === "ledger-bridge") {
        await this.watchPort(port)
      }
    })
  }

  async internalStopService(): Promise<void> {
    await super.internalStopService()

    if (this.bridgePort) {
      // if a bridge tab is open, close it with the service
      if (this.bridgePort.sender) {
        const { tab } = this.bridgePort.sender
        if (tab && tab.id) {
          await browser.tabs.remove(tab.id)
        }
      }
      this.bridgePort.disconnect()
    }
  }

  async watchPort(port: Runtime.Port): Promise<void> {
    console.log("Port connected!", port)

    // if a second Ledger bridge tab is opened, close out the first one
    if (this.bridgePort && this.bridgePort.sender) {
      const { tab } = this.bridgePort.sender
      if (tab && tab.id) {
        await browser.tabs.remove(tab.id)
      }
    }

    this.bridgePort = port

    port.onMessage.addListener((msg) => {
      console.log("Bridge port received message!", msg)
    })
  }
}

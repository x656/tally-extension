/// <reference types="w3c-web-usb" />

import React, { ReactElement, useState } from "react"

import TransportWebUSB from "@ledgerhq/hw-transport-webusb"
import EthApp from "@ledgerhq/hw-app-eth"
import getAppAndVersion from "@ledgerhq/live-common/lib/hw/getAppAndVersion"
import openApp from "@ledgerhq/live-common/lib/hw/openApp"

const timeout = 2 * 60 * 1000 // 2 minutes in ms
const pollingDelay = 1000 // 1 second in ms

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default () => {
  const [connecting, setConnecting] = useState(false)
  const [retrievedAddress, setRetrievedAddress] = useState<string | null>(null)
  return (
    <>
      {retrievedAddress && <span>Address: {retrievedAddress}</span>}
      <button
        type="button"
        disabled={connecting}
        onClick={async () => {
          const transport = await TransportWebUSB.create()
          const appAndVersion = await getAppAndVersion(transport)
          // TODO warn if we haven't tested with this particular version
          console.log(appAndVersion)
          if (appAndVersion?.name !== "Ethereum") {
            await openApp(transport, "Ethereum")
          }
          const app = new EthApp(transport)

          /* eslint-disable no-await-in-loop */
          let address: string
          // TODO loop until we're on the Ethereum app or we have a timeout
          for (let i = 0; i < timeout; i += pollingDelay) {
            try {
              const output = await app.getAddress("44'/60'/0'/0/0")
              address = output.address
              break
            } catch (err) {
              console.log(err)
              await sleep(pollingDelay)
            }
          }
          /* eslint-enable no-await-in-loop */

          // TODO send this to the extension to add the account
          setRetrievedAddress(address || null)
        }}
      >
        Connect Ledger
      </button>
    </>
  )
}

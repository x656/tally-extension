/// <reference types="w3c-web-usb" />

import React, { ReactElement, useState } from "react"

import TransportWebUSB from "@ledgerhq/hw-transport-webusb"
import ETHApp from "@ledgerhq/hw-app-eth"
import getAppAndVersion from "@ledgerhq/live-common/lib/hw/getAppAndVersion"
import openApp from "@ledgerhq/live-common/lib/hw/openApp"

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const timeout = 2 * 60 * 1000 // 2 minutes in ms
const pollingDelay = 1000 // 1 second in ms
const onClick = async function () {
  const transport = await TransportWebUSB.create()
  const appAndVersion = await getAppAndVersion(transport)
  // TODO warn if we haven't tested with this particular version
  console.log(appAndVersion)
  if (appAndVersion?.name !== "Ethereum") {
    await openApp(transport, "Ethereum")
  }
  const app = new ETHApp(transport)

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
  console.log("ADDRESS!", address)
}

export default () => <button onClick={onClick}>Connect Ledger</button>

import React from "react"
import ReactDOM from "react-dom"

import LedgerWebUSBBridge from "./pages/LedgerWebUSBBridge"

/**
 * Attaches the Ledger WebUSB Bridge UI to the specified DOM element
 */
async function attachToElement(element: Element): Promise<void> {
  ReactDOM.render(React.createElement(LedgerWebUSBBridge), element)
}

export default {
  attachToElement,
}

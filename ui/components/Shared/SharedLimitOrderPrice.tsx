import React, { ReactElement, useCallback, useState } from "react"
import SharedButton from "./SharedButton"
import SharedSlideUpMenu from "./SharedSlideUpMenu"
import SharedAssetItem from "./SharedAssetItem"
import SharedAssetIcon from "./SharedAssetIcon"

function LimitOrderToken(): ReactElement {
  return (
    <div>
      <button type="button">
        <div className="asset_icon_wrap">
          <SharedAssetIcon />
        </div>
        ETH
        <style jsx>{`
          button {
            display: flex;
            align-items: center;
            color: #fff;
            font-size: 16px;
            font-weight: 500;
            line-height: 24px;
            text-transform: uppercase;
          }
          .asset_icon_wrap {
            margin-right: 8px;
          }
        `}</style>
      </button>
    </div>
  )
}

interface SharedLimitOrderPriceProps {
  isTypeDestination: boolean
  onAssetSelected?: () => void
  label: string
  defaultToken: { name: string }
  isTokenOptionsLocked: boolean
}

export default function SharedLimitOrderPrice(
  props: SharedLimitOrderPriceProps
): ReactElement {
  const {
    isTypeDestination,
    label,
    defaultToken,
    isTokenOptionsLocked,
    onAssetSelected,
  } = props

  const [openAssetMenu, setOpenAssetMenu] = useState(false)
  const [selectedToken, setSelectedToken] = useState(defaultToken)

  const toggleIsTokenMenuOpen = useCallback(() => {
    if (!isTokenOptionsLocked) {
      setOpenAssetMenu((currentlyOpen) => !currentlyOpen)
      onAssetSelected?.()
    }
  }, [isTokenOptionsLocked, onAssetSelected])

  const setSelectedTokenAndClose = useCallback((token) => {
    setSelectedToken(token)
    setOpenAssetMenu(false)
  }, [])

  return (
    <label className="label">
      {label}
      <div className="asset_input standard_width">
        <LimitOrderToken />
        <input className="input_amount" type="text" placeholder="0.0" />
      </div>
      <style jsx>
        {`
          .asset_input {
            height: 72px;
            border-radius: 4px;
            background-color: var(--green-95);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0px 16px;
            box-sizing: border-box;
          }
          .token_input {
            width: 204px;
            height: 34px;
            color: var(--green-40);
            font-size: 28px;
            font-weight: 500;
            line-height: 32px;
          }
          .paste_button {
            height: 24px;
            color: var(--trophy-gold);
            font-size: 18px;
            font-weight: 600;
            line-height: 24px;
            text-align: center;
            display: flex;
          }
          .icon_paste {
            background: url("./images/paste@2x.png");
            background-size: 24px 24px;
            width: 24px;
            height: 24px;
            margin-left: 8px;
          }
          .input_amount {
            width: 98px;
            height: 32px;
            color: #ffffff;
            font-size: 22px;
            font-weight: 500;
            line-height: 32px;
            text-align: right;
          }
          .input_amount::placeholder {
            color: #ffffff;
          }
        `}
      </style>
    </label>
  )
}

SharedLimitOrderPrice.defaultProps = {
  isTypeDestination: false,
  isTokenOptionsLocked: false,
  defaultToken: { name: "" },
  label: "",
}

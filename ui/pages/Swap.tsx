import React, { ReactElement, useCallback, useState } from "react"
import CorePage from "../components/Core/CorePage"
import SharedAssetInput from "../components/Shared/SharedAssetInput"
import SharedLimitOrderPrice from "../components/Shared/SharedLimitOrderPrice"
import SharedButton from "../components/Shared/SharedButton"
import SharedSlideUpMenu from "../components/Shared/SharedSlideUpMenu"
import SwapQoute from "../components/Swap/SwapQuote"
import SharedActivityHeader from "../components/Shared/SharedActivityHeader"
import SwapTransactionSettings from "../components/Swap/SwapTransactionSettings"

export default function Swap(): ReactElement {
  const [openTokenMenu, setOpenTokenMenu] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)
  const [activeActivity, setActiveActivity] = useState("swap")

  const handleClick = useCallback(() => {
    setOpenTokenMenu((isCurrentlyOpen) => !isCurrentlyOpen)
  }, [])

  const handleAssetSelect = useCallback(() => {
    setSelectedCount((currentCount) => currentCount + 1)
  }, [])

  return (
    <>
      <CorePage>
        <SharedSlideUpMenu
          isOpen={openTokenMenu}
          close={handleClick}
          size="large"
        >
          <SwapQoute activeActivity={activeActivity} />
        </SharedSlideUpMenu>
        <div className="standard_width">
          <span aria-hidden="true" onClick={() => setActiveActivity("swap")}>
            <SharedActivityHeader
              inactive={activeActivity !== "swap"}
              label="Swap"
              activity="swap"
            />
          </span>
          <span className="activity_separator">•</span>
          <span
            aria-hidden="true"
            onClick={() => setActiveActivity("limit_order_swap")}
          >
            <SharedActivityHeader
              inactive={activeActivity !== "limit_order_swap"}
              label="Limit"
              activity="limit_order_swap"
            />
          </span>
          {activeActivity === "swap" && (
            <div className="form">
              <div className="form_input">
                <SharedAssetInput
                  onAssetSelected={handleAssetSelect}
                  label="Swap from:"
                />
              </div>
              <div className="icon_change" />
              <div className="form_input">
                <SharedAssetInput
                  onAssetSelected={handleAssetSelect}
                  label="Swap to:"
                />
              </div>
              <div className="settings_wrap">
                <SwapTransactionSettings activeActivity={activeActivity} />
              </div>
              <div className="footer standard_width_padded">
                {selectedCount < 2 ? (
                  <SharedButton
                    type="primary"
                    size="large"
                    isDisabled
                    onClick={handleClick}
                  >
                    Review swap
                  </SharedButton>
                ) : (
                  <SharedButton
                    type="primary"
                    size="large"
                    onClick={handleClick}
                  >
                    Get final quote
                  </SharedButton>
                )}
              </div>
            </div>
          )}
          {activeActivity === "limit_order_swap" && (
            <div className="form">
              <div className="form_input">
                <SharedAssetInput
                  onAssetSelected={handleAssetSelect}
                  label="You pay:"
                />
              </div>
              <div className="icon_change" />
              <div className="form_input">
                <SharedAssetInput
                  onAssetSelected={handleAssetSelect}
                  label="You receive:"
                />
              </div>
              <div className="form_input limit_order_price_input">
                <SharedLimitOrderPrice
                  onAssetSelected={handleAssetSelect}
                  label="Price:"
                />
              </div>
              <div className="settings_wrap">
                <SwapTransactionSettings activeActivity={activeActivity} />
              </div>
              <div className="footer standard_width_padded">
                {selectedCount < 3 ? (
                  <SharedButton
                    type="primary"
                    size="large"
                    isDisabled
                    onClick={handleClick}
                  >
                    Review order
                  </SharedButton>
                ) : (
                  <SharedButton
                    type="primary"
                    size="large"
                    onClick={handleClick}
                  >
                    Review order
                  </SharedButton>
                )}
              </div>
            </div>
          )}
        </div>
      </CorePage>
      <style jsx>
        {`
          .network_fee_group {
            display: flex;
            margin-bottom: 29px;
          }
          .network_fee_button {
            margin-right: 16px;
          }
          .activity_separator {
            font-size: 30px;
            margin-right: 4px;
            margin-left: 4px;
          }
          .label_right {
            margin-right: 6px;
          }
          .divider {
            width: 384px;
            border-bottom: 1px solid #000000;
            margin-left: -16px;
          }
          .total_amount_number {
            width: 150px;
            height: 32px;
            color: #e7296d;
            font-size: 22px;
            font-weight: 500;
            line-height: 32px;
          }
          .footer {
            display: flex;
            justify-content: center;
            margin-top: 24px;
            padding-bottom: 20px;
          }
          .total_label {
            width: 33px;
            height: 17px;
            color: var(--green-60);
            font-size: 14px;
            font-weight: 400;
            letter-spacing: 0.42px;
            line-height: 16px;
          }
          .icon_change {
            background: url("./images/change@2x.png") center no-repeat;
            background-size: 20px 20px;
            width: 20px;
            height: 20px;
            padding: 8px;
            border: 3px solid var(--hunter-green);
            background-color: var(--green-95);
            border-radius: 70%;
            margin: 0 auto;
            margin-top: -5px;
            margin-bottom: -32px;
            position: relative;
          }
          .settings_wrap {
            margin-top: 16px;
          }
          .limit_order_price_input {
            margin-top: 12px;
          }
        `}
      </style>
    </>
  )
}

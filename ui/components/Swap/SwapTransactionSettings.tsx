import React, { ReactElement, useState } from "react"
import SharedSlideUpMenu from "../Shared/SharedSlideUpMenu"
import SharedButton from "../Shared/SharedButton"
import SharedNetworkFeeGroup from "../Shared/SharedNetworkFeeGroup"
import SharedTransactionExpiryGroup from "../Shared/SharedTransactionExpiryGroup"

interface Props {
  activeActivity: string
}

export default function SwapTransactionSettings(props: Props): ReactElement {
  const { activeActivity } = props
  const [isSlideUpMenuOpen, setIsSlideUpMenuOpen] = useState(false)

  function handleClick() {
    setIsSlideUpMenuOpen(!isSlideUpMenuOpen)
  }

  return (
    <>
      <SharedSlideUpMenu
        isOpen={isSlideUpMenuOpen}
        size="small"
        close={() => {
          setIsSlideUpMenuOpen(false)
        }}
      >
        {activeActivity === "swap" && (
          <div className="settings_wrap">
            <div className="row row_slippage">
              <span className="settings_label">Slippage tolerance</span>
              <SharedButton type="secondary" size="medium" icon="chevron">
                1%
              </SharedButton>
            </div>
            <div className="row row_fee">
              <span className="settings_label settings_label_fee">
                Transaction Fee/Speed
              </span>
              <br />
              <SharedNetworkFeeGroup />
            </div>
          </div>
        )}
        {activeActivity === "limit_order_swap" && (
          <div className="settings_wrap">
            <div className="row row_expiry">
              <span className="settings_label settings_label_expiry">
                Transaction expiry
              </span>
              <br />
              <br />
              <SharedTransactionExpiryGroup />
            </div>
          </div>
        )}
      </SharedSlideUpMenu>
      <div className="top_label label">
        Transaction settings
        <button type="button" onClick={handleClick}>
          <span className="icon_cog" />
        </button>
      </div>
      {activeActivity === "swap" && (
        <div className="labels_wrap standard_width">
          <span className="label">
            Slippage tolerance
            <div className="info">1%</div>
          </span>
          <span className="label">
            Network Fee/Speed
            <div className="info">{"$24 / Fast <1min"}</div>
          </span>
        </div>
      )}
      {activeActivity === "limit_order_swap" && (
        <div className="labels_wrap standard_width">
          <span className="label">
            Transaction expiry
            <div className="info">1 hour</div>
          </span>
          <span className="label">
            KeeperDAO’s Keeper network will execute your order as soon as it
            finds sufficient liquidity, and if it finds MEV, you’ll receive
            $ROOK.
          </span>
        </div>
      )}
      <style jsx>
        {`
          .labels_wrap {
            border-radius: 4px;
            background-color: var(--green-95);
            padding: 16px;
            box-sizing: border-box;
          }
          .top_label {
            margin-bottom: 7px;
          }
          .row {
            padding: 15px 0px;
            display: flex;
            align-items: center;
          }
          .row_slippage {
            display: flex;
            justify-content: space-between;
            padding-bottom: 8px;
          }
          .row_fee {
            flex-direction: column;
            align-items: flex-start;
          }
          .row_expiry {
            display: block;
          }
          .settings_label {
            height: 17px;
            color: var(--green-40);
            font-size: 14px;
            font-weight: 400;
            letter-spacing: 0.42px;
            line-height: 16px;
          }
          .settings_label_fee .settings_label_expiry {
            margin-bottom: 7px;
          }
          .icon_cog {
            display: block;
            mask-image: url("./images/cog@2x.png");
            mask-size: cover;
            width: 12px;
            height: 12px;
            background-color: var(--green-60);
          }
          .icon_cog:hover {
            background-color: #fff;
          }
          .settings_wrap {
            width: 384px;
            height: 208px;
            background-color: var(--hunter-green);
            margin-top: 36px;
            padding: 0px 17px;
            box-sizing: border-box;
          }
          .label:first-of-type {
            margin-bottom: 7px;
          }
          .info {
            color: var(--green-20);
            font-size: 14px;
            font-weight: 400;
            letter-spacing: 0.42px;
            line-height: 16px;
            text-align: right;
          }
          .label {
            margin-bottom: 5px;
          }
        `}
      </style>
    </>
  )
}

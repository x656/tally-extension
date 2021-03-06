import React, { ReactElement } from "react"
import TopMenuProtocolSwitcher from "./TopMenuProtocolSwitcher"
import TopMenuProfileButton from "./TopMenuProfileButton"

interface Props {
  toggleOpenProtocolList: () => void
  toggleOpenNotifications: () => void
}

export default function TopMenu(props: Props): ReactElement {
  const { toggleOpenProtocolList, toggleOpenNotifications } = props

  return (
    <div className="nav_wrap">
      <nav className="standard_width_padded">
        <button type="button" onClick={toggleOpenProtocolList}>
          <TopMenuProtocolSwitcher />
        </button>
        <button type="button" onClick={toggleOpenNotifications}>
          <TopMenuProfileButton />
        </button>
      </nav>
      <style jsx>
        {`
          nav {
            flex-shrink: 0;
            height: 52px;
            margin-top: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .nav_wrap {
            width: 100%;
            box-shadow: 0px 6px 11px var(--hunter-green);
            margin-bottom: 6px;
          }
        `}
      </style>
    </div>
  )
}

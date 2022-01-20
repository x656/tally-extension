import React, { ReactElement, useState } from "react"
import SharedButton from "./SharedButton"

export default function SharedTransactionExpiryGroup(): ReactElement {
  const [selectedTranscationExpiry, setTransactionExpiry] = useState(0)

  return (
    <ul>
      <li>
        <SharedButton type="secondary" size="medium" fontSize="small">
          1 hour
        </SharedButton>
      </li>
      <li>
        <SharedButton type="secondary" size="medium" fontSize="small">
          2 hours
        </SharedButton>
      </li>
      <li>
        <SharedButton type="secondary" size="medium" fontSize="small">
          1 day
        </SharedButton>
      </li>
      <li>
        <SharedButton type="secondary" size="medium" fontSize="small">
          1 week
        </SharedButton>
      </li>
      <style jsx>
        {`
          ul {
            display: flex;
            margin-bottom: 29px;
          }
          li {
            margin-right: 16px;
          }
        `}
      </style>
    </ul>
  )
}

import { useState, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useAppSelector } from '../hooks'

import { dollarValue } from './utils'

function Tokens() {
  const breakdownData = useAppSelector((state) => state.firestore.breakdown)

  function getPercentage(value, total) {
    const v = new BigNumber(value).dividedBy(total).times(100).toFormat(1)
    return `${v}%`
  }
  const tokensLength = breakdownData.tokens.length

  return (
    <div>
      <table className="text-white text-sm bg-slate-800">
        <thead>
          <tr>
            <th className="text-left py-1 pl-6 pt-4">Symbol</th>
            <th className="text-right py-1 pt-4">Value</th>
            <th className="text-right py-1 pr-6 pt-4">%</th>
          </tr>
        </thead>
        <tbody>
          {breakdownData.tokens.map((token, i) => {
            const { symbol, value } = token

            if (i === tokensLength - 1) {
              return (
                <tr className="" key={i}>
                  <td className="text-left py-1 pl-6 pb-4">{symbol}</td>
                  <td className="text-right py-1 pl-8 pb-4">{dollarValue(value, 0)}</td>
                  <td className="text-right py-1 pl-6 pr-6 pb-4">{getPercentage(value, breakdownData.walletNav)}</td>
                </tr>
              )
            }
            return (
              <tr className="" key={i}>
                <td className="text-left py-1 pl-6">{symbol}</td>
                <td className="text-right py-1 pl-8">{dollarValue(value, 0)}</td>
                <td className="text-right py-1 pl-6 pr-6">{getPercentage(value, breakdownData.walletNav)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Tokens

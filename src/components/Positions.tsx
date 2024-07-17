import BigNumber from 'bignumber.js'
import { useAppSelector } from '../hooks'

import { dollarValue } from './utils'

function Row(positions) {
  const { entry_price, coin, upnl, position_value, liquidation_price, net_size, funding, mark_price } = positions
  const dp = new BigNumber(entry_price).dp()
  const percent = net_size > 0 ? mark_price / entry_price - 1 : entry_price / mark_price - 1
  return (
    <tr key={coin}>
      <td className="text-left p-1">{coin}</td>
      <td className="text-right p-1">{net_size}</td>
      <td className="text-right p-1">{dollarValue(position_value, 0)}</td>
      <td className="text-right p-1">{dollarValue(upnl, 0)}</td>
      <td className="text-right p-1">{new BigNumber(percent * 100).toFormat(1)}%</td>
      <td className="text-right p-1">{dollarValue(entry_price, dp)}</td>
      <td className="text-right p-1">{dollarValue(liquidation_price, dp)}</td>
      <td className="text-right p-1">{funding}%</td>
    </tr>
  )
}
function DeribitRow(positions) {
  const { entry_price, coin, upnl, position_value, liquidation_price, net_size, funding, mark_price } = positions

  const percent = net_size > 0 ? mark_price / entry_price - 1 : entry_price / mark_price - 1
  return (
    <tr key={coin}>
      <td className="text-left p-1">{coin}</td>
      <td className="text-right p-1">{net_size}</td>
      <td className="text-right p-1">{dollarValue(position_value, 0)}</td>
      <td className="text-right p-1">{dollarValue(upnl, 0)}</td>
      <td className="text-right p-1">{new BigNumber(percent * 100).toFormat(1)}%</td>
      <td className="text-right p-1">{entry_price}</td>
      <td className="text-right p-1">{`${liquidation_price} days`}</td>
      <td className="text-right p-1">{funding}%</td>
    </tr>
  )
}
function Deribit(data) {
  const { id, accountLeverage, nav, positions, fundingAmount } = data
  const fundingApr = new BigNumber(fundingAmount).dividedBy(nav).times(100).toFormat(2)
  return (
    <div className="text-white w-[800px] my-2 bg-slate-800 p-4 py-2 text-sm" key={id}>
      <div className="grid grid-cols-4">
        <div className="text-left p-1">{id}</div>
        <div className="text-left p-1">{new BigNumber(accountLeverage).times(100).toFormat(2)}%</div>
        <div className="text-right p-1">{fundingApr}%</div>
        <div className="text-right p-1">{dollarValue(nav, 0)}</div>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-1">Market</th>
            <th className="text-right p-1">Size</th>
            <th className="text-right p-1">Notional</th>
            <th className="text-right p-1">uPnL</th>
            <th className="text-right p-1">%</th>
            <th className="text-right p-1">Entry</th>
            <th className="text-right p-1">Expiry</th>
            <th className="text-right p-1">Yield</th>
          </tr>
        </thead>
        <tbody>{positions.map(DeribitRow)}</tbody>
      </table>
    </div>
  )
}
function Exchange(data) {
  const { id, accountLeverage, nav, positions, fundingAmount } = data
  if (id === 'deribit') {
    return Deribit(data)
  }
  const fundingApr = new BigNumber(fundingAmount).dividedBy(nav).times(100).toFormat(2)
  return (
    <div className="text-white w-[800px] my-2 bg-slate-800 p-4 py-2 text-sm" key={id}>
      <div className="grid grid-cols-4">
        <div className="text-left p-1">{id}</div>
        <div className="text-left p-1">{new BigNumber(accountLeverage).toFormat(2)}X</div>
        <div className="text-right p-1">{fundingApr}%</div>
        <div className="text-right p-1">{dollarValue(nav, 0)}</div>
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-1">Market</th>
            <th className="text-right p-1">Size</th>
            <th className="text-right p-1">Notional</th>
            <th className="text-right p-1">uPnL</th>
            <th className="text-right p-1">%</th>
            <th className="text-right p-1">Entry</th>
            <th className="text-right p-1">Liquidation</th>
            <th className="text-right p-1">Funding</th>
          </tr>
        </thead>
        <tbody>{positions.map(Row)}</tbody>
      </table>
    </div>
  )
}

function Positions() {
  const exchanges = useAppSelector((state) => state.firestore.exchanges)
  return <div className="mt-4">{exchanges.map(Exchange)}</div>
}

export default Positions

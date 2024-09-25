import BigNumber from 'bignumber.js'
import { useAppSelector } from '../hooks'

import { dollarValue } from './utils'

function Row(positions) {
  const { entry_price, coin, upnl, position_value, liquidation_price, net_size, funding, mark_price } = positions
  const dp = Math.min(new BigNumber(entry_price).dp(), 4)
  const netSizeDp = Math.min(new BigNumber(net_size).dp(), 4)
  const percent = net_size > 0 ? mark_price / entry_price - 1 : entry_price / mark_price - 1
  return (
    <tr key={coin}>
      <td className="text-left p-1">{coin}</td>
      <td className="text-right p-1">{new BigNumber(net_size).toFormat(netSizeDp)}</td>
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
  const netSizeDp = Math.min(new BigNumber(net_size).dp(), 4)
  const percent = net_size > 0 ? mark_price / entry_price - 1 : entry_price / mark_price - 1
  return (
    <tr key={coin}>
      <td className="text-left p-1">{coin}</td>
      <td className="text-right p-1">{new BigNumber(net_size).toFormat(netSizeDp)}</td>
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
  const perps = positions.filter((p) => p.coin.includes('PERPETUAL'))
  const options = positions.filter((p) => !p.coin.includes('PERPETUAL'))

  return (
    <div className="overflow-auto w-screen">
      <div className="text-white my-2 bg-slate-800 p-4 py-2 text-sm w-full max-w-[1200px] min-w-[900px]" key={id}>
        <div className="grid grid-cols-4">
          <div className="text-left p-1">{id}</div>
          <div className="text-left p-1">{new BigNumber(accountLeverage).times(100).toFormat(2)}%</div>
          <div className="text-right p-1">{fundingApr}%</div>
          <div className="text-right p-1">{dollarValue(nav, 0)}</div>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-1 w-[20.5%]">Market</th>
              <th className="text-right p-1 w-[11.5%]">Size</th>
              <th className="text-right p-1 w-[12.5%]">Notional</th>
              <th className="text-right p-1 w-[11.5%]">uPnL</th>
              <th className="text-right p-1 w-[5.5%]">%</th>
              <th className="text-right p-1 w-[12.5%]">Entry</th>
              <th className="text-right p-1 w-[12.5%]">Expiry</th>
              <th className="text-right p-1 w-[12.5%]">Yield</th>
            </tr>
          </thead>
          <tbody>{options.map(DeribitRow)}</tbody>
        </table>
        <PerpsTable rows={perps} />
      </div>
    </div>
  )
}

function PerpsTable({ rows }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left p-1 w-[20.5%]">Market</th>
          <th className="text-right p-1 w-[11.5%]">Size</th>
          <th className="text-right p-1 w-[12.5%]">Notional</th>
          <th className="text-right p-1 w-[11.5%]">uPnL</th>
          <th className="text-right p-1 w-[5.5%]">%</th>
          <th className="text-right p-1 w-[12.5%]">Entry</th>
          <th className="text-right p-1 w-[12.5%]">Liquidation</th>
          <th className="text-right p-1 w-[12.5%]">Funding</th>
        </tr>
      </thead>
      <tbody>{rows.map(Row)}</tbody>
    </table>
  )
}

function Exchange(data) {
  const { id, accountLeverage, nav, positions, fundingAmount } = data
  if (id === 'deribit') {
    return Deribit(data)
  }
  const fundingApr = new BigNumber(fundingAmount).dividedBy(nav).times(100).toFormat(2)
  return (
    <div className="overflow-auto w-screen">
      <div className="text-white  my-2 bg-slate-800 p-4 py-2 text-sm w-full max-w-[1200px] min-w-[900px]" key={id}>
        <div className="grid grid-cols-4">
          <div className="text-left p-1">{id}</div>
          <div className="text-left p-1">{new BigNumber(accountLeverage).toFormat(2)}X</div>
          <div className="text-right p-1">{fundingApr}%</div>
          <div className="text-right p-1">{dollarValue(nav, 0)}</div>
        </div>
        <PerpsTable rows={positions} />
      </div>
    </div>
  )
}

function Positions() {
  const exchanges = useAppSelector((state) => state.firestore.exchanges)
  return <div className="mt-4 flex flex-col md:items-center">{exchanges.map(Exchange)}</div>
}

export default Positions

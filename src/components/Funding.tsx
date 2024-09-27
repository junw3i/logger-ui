import BigNumber from 'bignumber.js'
import { useAppSelector } from '../hooks'
import { useRef } from 'react'

function BNWrapper(value, dp, suffix?) {
  const v = value || value === 0 ? new BigNumber(value).toFormat(dp) : new BigNumber(0).toFormat(dp)
  return suffix && v !== '' ? `${v}${suffix}` : v
}

function Funding() {
  const data = useAppSelector((state) => state.firestore.funding)

  const gridHoveredCellDataAddressAtt = 'data-hovered-cell-address'
  const cellDataAddressAtt = 'data-address'

  const gridElement = useRef<HTMLDivElement>(null)

  const updateHoveredCellAddress = (cellElement) => {
    const dataAddress = cellElement.getAttribute(cellDataAddressAtt)
    if (dataAddress) {
      gridElement.current.setAttribute(gridHoveredCellDataAddressAtt, dataAddress)
    }
  }

  const removeHoveredCellAddress = () => {
    gridElement.current.removeAttribute(gridHoveredCellDataAddressAtt)
  }

  const onMouseOver = (event: React.MouseEvent) => {
    if (gridElement.current) {
      updateHoveredCellAddress(event.currentTarget)
    }
  }

  const onMouseOut = () => {
    if (gridElement.current) {
      removeHoveredCellAddress()
    }
  }

  const createDataAddress = (col: number, row: number): string => `R${row}C${col}`

  const Cell = ({ children, className, col, row }) => {
    const dataAddress = createDataAddress(col, row)
    return (
      <div
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        className={`${className} ${dataAddress} cell`}
        data-address={dataAddress}
      >
        {children}
      </div>
    )
  }

  function renderRow(row, i) {
    const { id, btc, eth, sol, updatedAt } = row
    const now = new Date().getTime() / 1000
    const diff = Math.round((now - parseInt(updatedAt)) / 60)

    return (
      <>
        <Cell key={`id-${i}`} col={1} row={i + 1} className={`p-1 text-left pl-6`}>
          {id}
        </Cell>
        <Cell key={`btc-rate-${i}`} col={2} row={i + 1} className={`text-right px-4 tracking-wide py-1 bg-gray-700`}>
          {BNWrapper(btc?.rate, 1, '%')}
        </Cell>
        <Cell key={`btc-oi-${i}`} col={3} row={i + 1} className={`text-right px-4 tracking-wide py-1 bg-gray-700`}>
          {BNWrapper(btc?.oi, 0, 'M')}
        </Cell>
        <Cell key={`eth-rate-${i}`} col={4} row={i + 1} className={`text-right px-4 tracking-wide py-1`}>
          {BNWrapper(eth?.rate, 1, '%')}
        </Cell>
        <Cell key={`eth-oi-${i}`} col={5} row={i + 1} className={`text-right px-4 tracking-wide py-1`}>
          {BNWrapper(eth?.oi, 0, 'M')}
        </Cell>
        <Cell key={`sol-rate-${i}`} col={6} row={i + 1} className={`text-right px-4 tracking-wide py-1 bg-gray-700`}>
          {BNWrapper(sol?.rate, 1, '%')}
        </Cell>
        <Cell key={`sol-oi-${i}`} col={7} row={i + 1} className={`text-right px-4 tracking-wide py-1 bg-gray-700`}>
          {BNWrapper(sol?.oi, 0, 'M')}
        </Cell>
        <Cell key={`tz-${i}`} col={8} row={i + 1} className={`text-right px-4 tracking-wide py-1 pr-6`}>
          {diff}m ago
        </Cell>
      </>
    )
  }

  return (
    <div className="overflow-auto">
      <div className="bg-gray-800 text-white m-4 text-sm max-w-[1000px] mx-auto">
        <div className="grid grid_template" ref={gridElement}>
          <div className="text-left font-bold pt-4 pl-6">Exchange</div>
          <div className="col-span-2 font-bold pt-4 bg-gray-700">BTC</div>
          <div className="col-span-2 font-bold pt-4">ETH</div>
          <div className="col-span-2 font-bold pt-4 bg-gray-700">SOL</div>
          <div className="text-right font-bold pt-4 pr-6">Updated</div>
          {data.map(renderRow)}
          <div className="col-span-1 h-3"></div>
          <div className="col-span-2 h-3 bg-gray-700"></div>
          <div className="col-span-2 h-3"></div>
          <div className="col-span-2 h-3 bg-gray-700"></div>
          <div className="col-span-1 h-3"></div>
        </div>
      </div>
    </div>
  )
}

export default Funding

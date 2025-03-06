import { useAppSelector } from '../hooks'
import { useState } from 'react'
import { MirrorData } from '../saga/store/Firestore'
import BigNumber from 'bignumber.js'

function renderPosition({ coin, size, notional, entry_price, upnl, mark_price }: any) {
  const entry = new BigNumber(entry_price)
  const dp = entry.dp()
  const inProfit = upnl > 0
  const pnlColor = inProfit ? 'text-green-400' : 'text-red-500'
  const pnlCss = `p-2 ${pnlColor}`
  const pnlText = inProfit ? `$${new BigNumber(upnl).toFormat(0)}` : `-$${new BigNumber(upnl).abs().toFormat(0)}`
  return (
    <tr className="text-left">
      <th className="p-2 pl-0 text-neutral-200">{coin}</th>
      <th className="p-2  text-neutral-200">{size}</th>
      <th className="p-2  text-neutral-200">${new BigNumber(notional).toFormat(0)}</th>
      <th className="p-2  text-neutral-200">${entry.toFormat(dp)}</th>
      <th className={pnlCss}>{pnlText}</th>
      <th className="p-2  text-neutral-200">${new BigNumber(mark_price).toFormat(dp)}</th>
    </tr>
  )
}

function Mirror({ id, long_exposure, short_exposure, positions, account_value }: MirrorData) {
  const last6 = id.slice(-6)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const positions_ = [...positions]
  const sortedPositions = positions_
    .sort((a, b) => {
      if (a.notional > b.notional) {
        return -1
      }
      if (a.notional < b.notional) {
        return 1
      }
      return
    })
    .slice(0, 5)

  return (
    // <div className="text-white text-sm md:mx-auto w-screen md:w-fit bg-slate-800 p-4 mt-4 overflow-auto">
    <div className="overflow-auto w-screen md:w-auto">
      <div className="text-white  my-2 bg-black p-4 py-2 text-sm w-full max-w-[1200px] min-w-[1000px]" key={id}>
        <div className="flex gap-8 text-left">
          <div>
            <div className="flex items-center">
              <div className="text-sm text-neutral-400">Address</div>
              <button
                onClick={copyToClipboard}
                className=" text-neutral-400 p-1 rounded-xs border-none hover:text-white bg-black focus:outline-none hover:outline-none hover:shadow-none"
                title="Copy full address"
              >
                {copied ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                )}
              </button>
            </div>

            <span className="text-lg">{last6}</span>
          </div>
          <div className="w-32">
            <div className="text-sm text-neutral-400">Long</div>
            <span className="text-lg text-emerald-400">${new BigNumber(long_exposure).toFormat(0)}</span>
          </div>
          <div className="w-32">
            <div className="text-sm text-neutral-400">Short</div>
            <span className="text-lg text-red-400">${new BigNumber(short_exposure).toFormat(0)}</span>
          </div>
          <div className="w-32">
            <div className="text-sm text-neutral-400">NAV</div>
            <span className="text-lg ">${new BigNumber(account_value).toFormat(0)}</span>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 pl-0 text-neutral-400 font-medium text-left whitespace-nowrap">Market</th>
              <th className="p-2 text-neutral-400 font-medium text-left whitespace-nowrap">Size</th>
              <th className="p-2 text-neutral-400 font-medium text-left whitespace-nowrap">Notional</th>
              <th className="p-2 text-neutral-400 font-medium text-left whitespace-nowrap">Entry</th>
              <th className="p-2 text-neutral-400 font-medium text-left whitespace-nowrap">uPnL</th>
              <th className="p-2 text-neutral-400 font-medium text-left whitespace-nowrap">Mark</th>
            </tr>
          </thead>
          <tbody>{sortedPositions.map(renderPosition)}</tbody>
        </table>
      </div>
    </div>
  )
}

function Mirrors() {
  const mirrors = useAppSelector((state) => state.firestore.mirrors)

  const components = mirrors.map((mirror) => {
    return <Mirror key={mirror.id} {...mirror} />
  })

  return <div className="mt-4 flex flex-col md:items-center">{components}</div>
}

export default Mirrors

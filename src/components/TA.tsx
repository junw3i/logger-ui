import dayjs from 'dayjs'
import { useAppSelector } from '../hooks'
import BigNumber from 'bignumber.js'

function renderTAData(data) {
  const keys = Object.keys(data).sort()
  const datas = keys.map((key) => {
    return (
      <div key={key} className="ml-6 min-w-20 p-1">
        <div className="font-bold text-right text-xs">{key}</div>
        <div className="text-right">{data[key]}</div>
      </div>
    )
  })
  return <div className="flex">{datas}</div>
}

interface TAData {
  id: string
  data: object
  updatedAt: number
  signal: SignalData
}

interface SignalData {
  timestamp: number
  signal: 'long' | 'short'
}

function renderLastSignal(signal: SignalData) {
  const now = dayjs().unix()
  const diff = now - signal.timestamp
  // to days
  const days = new BigNumber(diff / 86400).dp(1).toNumber()
  return (
    <div className="min-w-20 p-1">
      <div className="font-bold">{signal.signal.toUpperCase()}</div>
      <div className="text-xs">{days} DAYS</div>
    </div>
  )
}

function renderAnalyze(id, data) {
  const strategy = id.split(':')[2]
  console.log('strategy', strategy)
  let value = 'NEUTRAL'
  if (strategy === 'trend') {
    const fast = new BigNumber(data.fast)
    const slow = new BigNumber(data.slow)
    if (fast.gt(slow)) {
      value = 'BULL'
    } else {
      value = 'BEAR'
    }
    const gap = fast.minus(slow).dividedBy(slow).times(100).dp(1).toNumber()

    return (
      <div>
        <div>{value}</div>
        <div className="text-xs">{gap}% GAP</div>
      </div>
    )
  } else if (strategy === 'macdv') {
    let buyValue = ''
    if (data.macd_0 > data.signal_0) {
      value = 'BULL'
    } else {
      value = 'BEAR'
    }
    if (data.macd_0 > 150) {
      buyValue = 'OVERBOUGHT'
    }
    if (data.macd_0 < -150) {
      buyValue = 'OVERSOLD'
    }
    return (
      <div>
        <div>{value}</div>
        <div className="text-xs">{buyValue}</div>
      </div>
    )
  } else if (strategy === 'stoch') {
    if (data.km_0 > 80) {
      value = 'OVERBOUGHT'
    } else if (data.km_0 < 20) {
      value = 'OVERSOLD'
    }
    return (
      <div>
        <div>{value}</div>
      </div>
    )
  }

  return <div>{value}</div>
}
function TA() {
  const taData = useAppSelector((state) => state.firestore.ta)
  // const impliedSkew = useAppSelector((state) => state.firestore.impliedSkew)

  return (
    <div className="text-white text-sm md:mx-auto w-fit bg-slate-800 p-4 mt-4">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Last</th>
            <th>Analysis</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {taData.map((data: TAData) => (
            <tr key={data.id} className="">
              <td className="font-bold px-2">{data.id}</td>
              <td className="px-4">{renderLastSignal(data.signal)}</td>
              <td className="px-4">{renderAnalyze(data.id, data.data)}</td>
              <td>{renderTAData(data.data)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TA

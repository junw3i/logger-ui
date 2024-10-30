import { useAppSelector } from '../hooks'

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
}

function TA() {
  const taData = useAppSelector((state) => state.firestore.ta)
  const impliedSkew = useAppSelector((state) => state.firestore.impliedSkew)
  console.log('impliedSkew', impliedSkew)

  return (
    <div className="text-white text-sm md:mx-auto w-fit bg-slate-800 p-4 mt-4">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {taData.map((data: TAData) => (
            <tr key={data.id} className="">
              <td className="font-bold">{data.id}</td>
              <td></td>
              <td>{renderTAData(data.data)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TA

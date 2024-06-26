import BigNumber from 'bignumber.js'
import { useAppSelector } from '../hooks'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function BNWrapper(value, dp, suffix?) {
  const v = value || value === 0 ? new BigNumber(value).toFormat(dp) : new BigNumber(0).toFormat(dp)
  return suffix && v !== '' ? `${v}${suffix}` : v
}

function BoxWrapper({ children }) {
  return <div className="max-w-[25%] basis-1/4 px-[1px]">{children}</div>
}

function BoxData({ title, value, isLoaded }) {
  return (
    <div className="box-data">
      <div className="text-lg font-bold leading-none">{isLoaded ? value : <Skeleton width={70} />}</div>
      <div className="text-xs">{title}</div>
    </div>
  )
}
function Nav() {
  const exchangeData = useAppSelector((state) => state.firestore.exchanges)
  const debankData = useAppSelector((state) => state.firestore.debank)
  const priceData = useAppSelector((state) => state.coinbase.price)
  // console.log('ex', exchangeData)
  console.log('priceData', priceData)

  return (
    <SkeletonTheme baseColor="#5294e0" highlightColor="#96c7ff" borderRadius="0.5rem" duration={4}>
      <div className=" text-white m-4 text-sm flex">
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData title="ETH" value={`$${priceData}`} isLoaded={priceData !== '0'} />
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData title="NAV" value="$2,321.23" isLoaded={false} />
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData title="EXPOSURE" value="$2,321.23" isLoaded={false} />
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData title="STABLES" value="$2,321.23" isLoaded={false} />
          </div>
        </BoxWrapper>
      </div>
    </SkeletonTheme>
  )
}

export default Nav

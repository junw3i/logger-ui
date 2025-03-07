import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useAppSelector } from '../hooks'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function BoxWrapper({ children }) {
  // return <div className="max-w-[25%] basis-1/4 px-[1px]">{children}</div>
  return <div className="px-[1px] mt-[1px] w-[50vw] md:w-[200px]">{children}</div>
}

function BoxData({ title, value, isLoaded }) {
  return (
    <div className="box-data">
      <div className="text-lg font-bold leading-none">{isLoaded ? value : <Skeleton width={70} />}</div>
      <div className="text-xs">{title}</div>
    </div>
  )
}

function calculateExposure(exchangeData) {
  const exchangeTotal = exchangeData.reduce((acc, e) => {
    if (e.id === 'deribit') return acc
    const accountTotal = e.positions.reduce((acc2, { position_value, net_size }) => {
      if (net_size > 0) return acc2.plus(position_value)
      return acc2.minus(position_value)
    }, new BigNumber(0))
    return acc.plus(accountTotal)
  }, new BigNumber(0))
  const debankTotal = new BigNumber(0)
  return exchangeTotal.plus(debankTotal).toFormat(2)
}

function calculateStables(tokens) {
  let stables = 0
  for (const token of tokens) {
    if (token.symbol === 'USD') {
      stables += token.value
    }
  }
  return stables
}

function Nav() {
  const exchangeData = useAppSelector((state) => state.firestore.exchanges)
  const priceData = useAppSelector((state) => state.coinbase.prices)
  const breakdownData = useAppSelector((state) => state.firestore.breakdown)
  const impliedSkew = useAppSelector((state) => state.firestore.impliedSkew)
  console.log('impliedSkew', impliedSkew)
  const exposure = useMemo(() => calculateExposure(exchangeData), [exchangeData])
  const stables = useMemo(() => calculateStables(breakdownData.tokens), [breakdownData.tokens])

  return (
    <SkeletonTheme baseColor="#5294e0" highlightColor="#96c7ff" borderRadius="0.5rem" duration={4}>
      <div className=" text-white  text-sm inline-flex max-w-[1000px] flex-wrap md:mx-auto">
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData title="ETH" value={`$${priceData.ETH}`} isLoaded={priceData.ETH !== '0'} />
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData title="BTC" value={`$${priceData.BTC}`} isLoaded={priceData.BTC !== '0'} />
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData title="SOL" value={`$${priceData.SOL}`} isLoaded={priceData.SOL !== '0'} />
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData title="STABLES" value={`$${new BigNumber(stables).toFormat(0)}`} isLoaded={stables !== 0} />
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData
              title="NAV"
              value={`$${new BigNumber(breakdownData.walletNav).toFormat(0)}`}
              isLoaded={breakdownData.walletNav !== 0}
            />
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData title="EXPOSURE" value={`$${exposure}`} isLoaded={true} />
          </div>
        </BoxWrapper>
      </div>
    </SkeletonTheme>
  )
}

export default Nav

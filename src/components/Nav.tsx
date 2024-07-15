import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useAppSelector } from '../hooks'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { dollarValue } from './utils'

function BoxWrapper({ children }) {
  // return <div className="max-w-[25%] basis-1/4 px-[1px]">{children}</div>
  return <div className="w-[200px] px-[1px] mt-[1px]">{children}</div>
}

function BoxData({ title, value, isLoaded }) {
  return (
    <div className="box-data">
      <div className="text-lg font-bold leading-none">{isLoaded ? value : <Skeleton width={70} />}</div>
      <div className="text-xs">{title}</div>
    </div>
  )
}

function calculateNAV(exchangeData, debankData) {
  const exchangeTotal = exchangeData.reduce((acc, { nav }) => {
    return acc.plus(nav)
  }, new BigNumber(0))
  const debankTotal = debankData.reduce((acc, { totalValue }) => {
    return acc.plus(totalValue)
  }, new BigNumber(0))
  return exchangeTotal.plus(debankTotal)
}

function calculateExposure(exchangeData) {
  const exchangeTotal = exchangeData.reduce((acc, { positions }) => {
    const accountTotal = positions.reduce((acc2, { position_value, net_size }) => {
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
  const priceData = useAppSelector((state) => state.coinbase.price)
  const breakdownData = useAppSelector((state) => state.firestore.breakdown)
  const yieldData = useAppSelector((state) => state.firestore.yield)
  const exposure = useMemo(() => calculateExposure(exchangeData), [exchangeData])
  const stables = useMemo(() => calculateStables(breakdownData.tokens), [breakdownData.tokens])
  const totalYield = useMemo(() => {
    const positionsYield = Object.values(yieldData).reduce((acc, value) => {
      return acc.plus(value)
    }, new BigNumber(0))
    return new BigNumber(breakdownData.farmNav).times(0.1).plus(positionsYield)
  }, [yieldData, breakdownData.farmNav])

  const yieldApr = totalYield.dividedBy(breakdownData.walletNav).times(100).toFormat(2)

  return (
    <SkeletonTheme baseColor="#5294e0" highlightColor="#96c7ff" borderRadius="0.5rem" duration={4}>
      <div className=" text-white m-4 text-sm flex max-w-[1200px] flex-wrap">
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData title="ETH" value={`$${priceData}`} isLoaded={priceData !== '0'} />
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
            <BoxData
              title="FARMING"
              value={`$${new BigNumber(breakdownData.farmNav).toFormat(0)}`}
              isLoaded={breakdownData.farmNav !== 0}
            />
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData title="EXPOSURE" value={`$${exposure}`} isLoaded={true} />
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData title="YIELD" value={dollarValue(totalYield.toNumber(), 0)} isLoaded={true} />
          </div>
        </BoxWrapper>
        <BoxWrapper>
          <div className="box-outline bg-slate-800 p-3">
            <BoxData title="YIELD APR" value={`${yieldApr}%`} isLoaded={true} />
          </div>
        </BoxWrapper>
      </div>
    </SkeletonTheme>
  )
}

export default Nav

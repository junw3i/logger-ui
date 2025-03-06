import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import {
  ExchangeData,
  updateFunding,
  updateExchanges,
  DebankData,
  updateDebank,
  WalletData,
  updateBreakdown,
  ImpliedSkewData,
  updateImpliedSkew,
  updateTA,
  MirrorData,
  updateMirrors,
} from './store/Firestore'
import { delay, put, select } from 'redux-saga/effects'
import dayjs from 'dayjs'
import { getMarketPrices } from './selectors'
import BigNumber from 'bignumber.js'

interface FundingData {
  btc: { rate: number; oi: number }
  eth: { rate: number; oi: number }
  sol: { rate: number; oi: number }
  updatedAt: number
}

// Function to fetch all documents in a collection
async function getAllDocuments(collectionName: string) {
  const collectionRef = collection(db, collectionName)
  const querySnapshot = await getDocs(collectionRef)

  const documents = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))

  return documents
}

async function getTA() {
  const all = await getAllDocuments('ta')
  return all
}

async function getFunding() {
  const unix = dayjs().unix()
  const querySnapshot = await getDocs(collection(db, 'funding'))
  const dataList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as FundingData) }))
  const currentList = dataList.filter((row) => unix - row.updatedAt < 3600 * 3)

  currentList.sort((a, b) => a.id.localeCompare(b.id))
  const millionedData = currentList.map((row) => {
    return {
      id: row.id,
      btc: { rate: row.btc ? row.btc.rate : 0, oi: row.btc?.oi / 1000000 },
      eth: { rate: row.eth ? row.eth.rate : 0, oi: row.eth?.oi / 1000000 },
      sol: { rate: row.sol ? row.sol.rate : 0, oi: row.sol?.oi / 1000000 },
      updatedAt: row.updatedAt,
    }
  })
  return millionedData
}

export function* fundingSaga() {
  try {
    const funding = yield getFunding()
    yield put(updateFunding(funding))
  } catch (error) {
    console.error(error)
  }
}

async function getExchanges() {
  const querySnapshot = await getDocs(collection(db, 'exchanges'))
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ExchangeData) }))
}

/* calculates the annual funding cost */
function calculateFunding(net_size, notional, rate) {
  const notionalValue = net_size > 0 ? notional : -notional
  return -(notionalValue * rate) / 100
}

export function* exchangesSaga() {
  try {
    const data = yield getExchanges()
    const now = dayjs().unix()
    const filteredData = data.filter((exchange) => now - exchange.updatedAt < 3600 * 2)
    // wait for eth price != 0
    let ethPrice = '0'
    while (ethPrice === '0') {
      ethPrice = (yield select(getMarketPrices)).ETH
      yield delay(1000)
    }

    const computedData = filteredData.map((exchange: ExchangeData) => {
      const { positions } = exchange
      let fundingAmount = 0
      for (const position of positions) {
        const { net_size, position_value, funding } = position
        if (exchange.id === 'deribit') {
          // as options sellers, we used the entry price as the yield
          if (net_size < 0) {
            fundingAmount += new BigNumber(net_size)
              .abs()
              .times(ethPrice.replace(',', ''))
              .times(funding)
              .div(100)
              .toNumber()
          }
        } else {
          fundingAmount += calculateFunding(net_size, position_value, funding)
        }
      }

      return { ...exchange, fundingAmount }
    })

    computedData.sort((a, b) => b.nav - a.nav)
    yield put(updateExchanges(computedData))
  } catch (error) {
    console.error(error)
  }
}

async function getDebank() {
  const querySnapshot = await getDocs(collection(db, 'debank'))
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as DebankData) }))
}

export function* debankSaga() {
  try {
    const data = yield getDebank()
    yield put(updateDebank(data))
  } catch (error) {
    console.error(error)
  }
}

async function getWallets() {
  const querySnapshot = await getDocs(collection(db, 'wallets'))
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as WalletData[]) }))
}

async function getMirrors() {
  const querySnapshot = await getDocs(collection(db, 'mirror_data'))
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as MirrorData[]) }))
}
// async function getExchanges() {
//   const querySnapshot = await getDocs(collection(db, 'exchanges'))
//   return querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ExchangeData[]) }))
// }

function isETH(symbol: string): boolean {
  if (symbol.toLowerCase().includes('eth')) return true
  if (symbol.includes('Re7LRT')) return true
  return false
}

function updatePositionValue(market: string, data, position) {
  const positionValue = position.net_size > 0 ? position.position_value : -position.position_value
  if (data[market]) {
    data[market] += positionValue
  } else {
    data[market] = positionValue
  }
  return data
}

export function* walletsSaga() {
  try {
    const data = yield getWallets()
    const unixThreshold = dayjs().unix() - 3600 * 2 // 2 hours
    const tokenList = []
    const tokensMap = {}

    for (const wallet of data) {
      const { updatedAt, tokens } = wallet
      if (updatedAt > unixThreshold) {
        tokens.forEach((token) => {
          tokenList.push({ ...token, address: wallet.id })
        })
      }
    }
    const exchanges = yield getExchanges()
    let positionsValue = {}
    exchanges.forEach((exchange: ExchangeData) => {
      const { assets, updatedAt, positions } = exchange
      if (updatedAt > unixThreshold) {
        if (exchange.exchange === 'deribit') {
          for (const position of positions) {
            if (position.coin.includes('PERPETUAL')) {
              const market = position.coin.split('-')[0]
              positionsValue = updatePositionValue(market, positionsValue, position)
            }
          }
        } else if (exchange.exchange === 'hyperliquid') {
          for (const position of positions) {
            positionsValue = updatePositionValue(position.coin, positionsValue, position)
          }
        } else if (exchange.exchange === 'binance') {
          for (const position of positions) {
            // remove the 'USDT' from the coin name
            const market = position.coin.split('USDT')[0]
            positionsValue = updatePositionValue(market, positionsValue, position)
          }
        }
        assets.forEach((asset) => {
          tokenList.push({ ...asset, location: 'exchange', address: exchange.id })
        })
      }
    })

    tokenList.forEach((token) => {
      const { symbol, amount, price, isStable } = token
      let symbol_ = isStable ? 'USD' : symbol
      if (symbol_.includes('BTC')) {
        symbol_ = 'BTC'
      }

      if (tokensMap[symbol_]) {
        tokensMap[symbol_].amount += amount
        tokensMap[symbol_].price = price
      } else {
        tokensMap[symbol_] = { amount, price }
      }
    })

    // convert map to array
    const tokens = Object.keys(tokensMap).map((symbol) => {
      return { symbol, ...tokensMap[symbol], value: tokensMap[symbol].amount * tokensMap[symbol].price }
    })
    tokens.sort((a, b) => b.value - a.value)

    const aggregated = {}
    tokens.forEach((token) => {
      const { symbol, value } = token
      const s = isETH(symbol) ? 'ETH' : symbol
      if (aggregated[s]) {
        aggregated[s] += value
      } else {
        aggregated[s] = value
      }
    })

    let walletNav = 0
    const aggregatedTokens = Object.keys(aggregated).map((symbol) => {
      walletNav += aggregated[symbol]
      return { symbol, value: aggregated[symbol] }
    })

    aggregatedTokens.sort((a, b) => b.value - a.value)

    // calcualate token exposure
    // fetch all positions

    const exposures = aggregatedTokens.map((token) => {
      const { symbol, value } = token
      if (positionsValue[symbol]) {
        return {
          symbol,
          value: value + positionsValue[symbol],
        }
      }
      return token
    })
    const positionsValueKeys = Object.keys(positionsValue)
    for (const key of positionsValueKeys) {
      const found = exposures.find((exposure) => exposure.symbol === key)
      if (!found) {
        exposures.push({ symbol: key, value: positionsValue[key] })
      }
    }
    exposures.sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    const topExposures = []
    for (const exposure of exposures) {
      const percent = new BigNumber(exposure.value).abs().dividedBy(walletNav).times(100).dp(0)
      if (percent.gt(0) && exposure.symbol !== 'USD') {
        const value = new BigNumber(exposure.value)
        const valueStr = value.isPositive() ? `$${value.toFormat(0)}` : `-$${value.abs().toFormat(0)}`
        topExposures.push({
          symbol: exposure.symbol,
          value: valueStr,
          percent: percent.toNumber(),
        })
      }
    }

    yield put(
      updateBreakdown({
        walletNav,
        tokens: aggregatedTokens,
        topExposures: topExposures,
      })
    )
  } catch (error) {
    console.error(error)
  }
}

async function getImpliedSkew() {
  const stochSnapshot = await getDocs(collection(db, 'implied_skew'))
  return stochSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ImpliedSkewData[]) }))
}

export function* taSaga() {
  try {
    const unix = dayjs().unix()
    const all = yield getTA()

    const now = dayjs().unix()
    const taUpdated = all.filter((row) => row.updatedAt > now - 3600).sort((a, b) => a.id - b.id)
    // console.log(taUpdated)
    yield put(updateTA(taUpdated))

    const impliedSkew = yield getImpliedSkew()

    if (impliedSkew[0].updatedAt > unix - 3600) {
      yield put(
        updateImpliedSkew({
          '7': impliedSkew[0]['0'],
          '30': impliedSkew[0]['1'],
          '60': impliedSkew[0]['2'],
          '90': impliedSkew[0]['3'],
          '180': impliedSkew[0]['4'],
        })
      )
    }
  } catch (error) {
    console.error(error)
  }
}

export function* mirrorsSaga() {
  const mirrors = yield getMirrors()
  const now = dayjs().unix()
  const filtered = mirrors.filter((mirror) => now - mirror.last_updated < 3600 * 24)
  yield put(updateMirrors(filtered))
}

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
  updateYield,
  updateTrend,
  TokenData,
} from './store/Firestore'
import { delay, put, select } from 'redux-saga/effects'
import dayjs from 'dayjs'
import { getEthPrice } from './selectors'
import BigNumber from 'bignumber.js'

interface FundingData {
  btc: { rate: number; oi: number }
  eth: { rate: number; oi: number }
  sol: { rate: number; oi: number }
  updatedAt: number
}

export function* trendSaga() {
  try {
    const trend = yield getTrend()
    yield put(updateTrend(trend))
  } catch (error) {
    console.error(error)
  }
}
async function getTrend() {
  const docRef = doc(db, 'trend', 'current')
  const docSnap = await getDoc(docRef)
  return docSnap.data()
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
    const yieldInfo = {}
    const filteredData = data.filter((exchange) => now - exchange.updatedAt < 3600 * 2)
    // wait for eth price != 0
    let ethPrice = '0'
    while (ethPrice === '0') {
      ethPrice = yield select(getEthPrice)
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

      yieldInfo[exchange.id] = fundingAmount

      return { ...exchange, fundingAmount }
    })

    computedData.sort((a, b) => b.nav - a.nav)
    yield put(updateYield(yieldInfo))
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
// async function getExchanges() {
//   const querySnapshot = await getDocs(collection(db, 'exchanges'))
//   return querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ExchangeData[]) }))
// }

function isETH(symbol: string): boolean {
  if (symbol.toLowerCase().includes('eth')) return true
  if (symbol.includes('Re7LRT')) return true
  return false
}

export function* walletsSaga() {
  try {
    const data = yield getWallets()
    const unixThreshold = dayjs().unix() - 3600 * 2
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
    exchanges.forEach((exchange: ExchangeData) => {
      const { assets, updatedAt } = exchange
      if (updatedAt > unixThreshold) {
        if (exchange.id === 'hyper_42c1') {
          // assumes this account is used for cash and carry
          // derives stables from positions and nav
          for (const position of exchange.positions) {
            const tokenData: TokenData = {
              amount: position.net_size,
              chain: 'hyperliquid',
              isStable: false,
              location: 'exchange',
              price: position.mark_price,
              symbol: position.coin,
            }
            const usdData: TokenData = {
              amount: position.position_value,
              chain: 'hyperliquid',
              isStable: true,
              location: 'exchange',
              price: 1,
              symbol: 'USD',
            }

            tokenList.push({ ...tokenData, location: 'exchange', address: exchange.id })
            tokenList.push({ ...usdData, location: 'exchange', address: exchange.id })
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

    // get farm data
    let farmValue = 0
    for (const token of tokenList) {
      if (token.location !== 'wallet' && token.location !== 'exchange') {
        farmValue += token.amount * token.price
      }
    }

    yield put(
      updateBreakdown({
        walletNav,
        farmNav: farmValue,
        tokens: aggregatedTokens,
      })
    )
  } catch (error) {
    console.error(error)
  }
}

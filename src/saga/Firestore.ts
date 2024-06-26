import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { ExchangeData, updateFunding, updateExchanges, DebankData, updateDebank } from './store/Firestore'
import { put } from 'redux-saga/effects'

interface FundingData {
  btc: { rate: number; oi: number }
  eth: { rate: number; oi: number }
  sol: { rate: number; oi: number }
  updatedAt: number
}

async function getFunding() {
  const querySnapshot = await getDocs(collection(db, 'funding'))
  const dataList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as FundingData) }))
  dataList.sort((a, b) => a.id.localeCompare(b.id))
  const millionedData = dataList.map((row) => {
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

async function getHyperliquid() {
  const querySnapshot = await getDocs(collection(db, 'nav'))
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ExchangeData) }))
}

export function* hlSaga() {
  try {
    const data = yield getHyperliquid()
    yield put(updateExchanges(data))
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

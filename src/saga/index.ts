import { fork } from 'redux-saga/effects'
import coinbaseSaga from './Coinbase'

export function* rootSaga() {
  yield fork(coinbaseSaga)
}

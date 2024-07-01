import { fork } from 'redux-saga/effects'
import coinbaseSaga from './Coinbase'
import { fundingSaga, hlSaga, debankSaga, walletsSaga } from './Firestore'

export function* rootSaga() {
  yield fork(coinbaseSaga)
  yield fork(fundingSaga)
  yield fork(hlSaga)
  yield fork(debankSaga)
  yield fork(walletsSaga)
}

import { fork } from 'redux-saga/effects'
import coinbaseSaga from './Coinbase'
import { fundingSaga, exchangesSaga, walletsSaga, taSaga, mirrorsSaga } from './Firestore'

export function* rootSaga() {
  yield fork(coinbaseSaga)
  yield fork(fundingSaga)
  yield fork(exchangesSaga)
  // yield fork(debankSaga)
  yield fork(walletsSaga)
  yield fork(taSaga)
  yield fork(mirrorsSaga)
}

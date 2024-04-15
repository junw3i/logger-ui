import { configureStore } from '@reduxjs/toolkit'
import coinbaseReducer from './Coinbase'
import createSagaMiddleware from 'redux-saga'
import { rootSaga } from '..'
import { combineReducers } from 'redux'

const sagaMiddleware = createSagaMiddleware()

const reducer = combineReducers({
  // here we will be adding reducers
  coinbase: coinbaseReducer,
})

export const store = configureStore({
  reducer,
  // middleware: [sagaMiddleware],
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
})

sagaMiddleware.run(rootSaga)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

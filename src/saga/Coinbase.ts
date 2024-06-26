/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventChannel } from 'redux-saga'
import { put, take, call } from 'redux-saga/effects'
import { updateLastPrice } from './store/Coinbase'
import BigNumber from 'bignumber.js'

interface WebSocketMessage {
  data: any
}
function initWebsocket() {
  return eventChannel((emitter) => {
    const ws = new WebSocket('wss://ws-feed.pro.coinbase.com')
    ws.onopen = () => {
      console.log('opening...')
      const message = {
        type: 'subscribe',
        channels: ['ticker'],
        product_ids: ['ETH-USD'],
      }
      ws.send(JSON.stringify(message))
    }
    ws.onclose = () => {
      console.log('disconnected, reconnecting in 3 seconds')
      setTimeout(function () {
        initWebsocket()
      }, 3000)
    }
    ws.onerror = (error) => {
      console.log('WebSocket error ' + error)
      console.dir(error)
    }
    ws.onmessage = (e: WebSocketMessage) => {
      let msg = null
      try {
        msg = JSON.parse(e.data)
      } catch (e: any) {
        console.error(`Error parsing : ${e.data}`)
      }

      if (msg) {
        const { type, price } = msg
        switch (type) {
          case 'ticker':
            return emitter({ type: updateLastPrice.toString(), payload: new BigNumber(price).toFormat(2) })
          default:
          // nothing to do
        }
      }
    }
    // unsubscribe function
    return () => {
      console.log('Socket off')
    }
  })
}
export default function* coinbaseSaga() {
  const channel: any = yield call(initWebsocket)
  while (true) {
    const action: any = yield take(channel)
    yield put(action)
  }
}

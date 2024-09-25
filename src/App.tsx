import { Provider } from 'react-redux'
import { store } from './saga/store'

import Funding from './components/Funding'
import Nav from './components/Nav'
import Tokens from './components/Tokens'
import Positions from './components/Positions'
import './App.css'

function App() {
  return (
    <Provider store={store}>
      <div className="w-screen md:max-w-screen-2xl ">
        <a href="https://pro.amberdata.io/options/deribit/eth/historic/" target="_blank">
          GVOL
        </a>
        <Funding />
        <Nav />
        <Tokens />
        <Positions />
      </div>
      <div className="w-96 mt-4">
        <div className="mx-auto w-full text-center bg-black text-white h-96">
          <div className="h-6 bg-gray-800 relative flex items-center justify-center">
            <div className="absolute flex space-x-2 pl-2 left-0">
              <div className="terminal-button bg-red-500" />
              <div className="terminal-button bg-yellow-300" />
              <div className="terminal-button bg-green-500" />
            </div>
            <div>header</div>
          </div>
          <div className="p-4">
            <h1 className="animated-text fade-in">Logger</h1>
          </div>
        </div>
      </div>
    </Provider>
  )
}

export default App

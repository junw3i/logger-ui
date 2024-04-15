import './App.css'

function App() {
  return (
    <div className="w-96">
      <div className="mx-auto w-full text-center bg-black text-white rounded-lg h-96">
        <div className="h-6 bg-gray-800 rounded-lg relative flex items-center justify-center">
          <div className="absolute flex space-x-2 pl-2 left-0">
            <div className="terminal-button bg-red-500" />
            <div className="terminal-button bg-yellow-300" />
            <div className="terminal-button bg-green-500" />
          </div>
          <div>header</div>
        </div>
        <div className="p-4">
          <h1 className="animated-text fade-in">Vite + React</h1>
        </div>
      </div>
    </div>
  )
}

export default App

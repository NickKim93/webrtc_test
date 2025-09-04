import { useState } from 'react'
import './App.css'

function App() {
  const [ok] = useState(true);
  return (
    <>
      <div style={{padding: 16}}>
        <h1>Front Test</h1>
        {<p>Status: {ok ? 'ready' : '...'}</p>}
      </div>
    </>
  )
}

export default App

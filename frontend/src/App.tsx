import axios from 'axios'
import  { useState } from 'react'




function App() {

  const [url, setUrl] = useState<string>('')



  return (
    <>
     <h1 className="text-3xl font-bold">Basic api integration for testing purpose</h1>
   
     <input type="text" value={url} onChange={e => setUrl(e.target.value)} />
     <button onClick={() => axios.post('http://localhost:3000/crawl', { url })}>Crawl</button>
    </>
  )
}

export default App

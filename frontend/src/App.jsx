import { useState } from 'react'
import './App.css'
import LandingPage from './pages/LandingPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div style={{height:"100vh",width:"100vw",padding:0,margin:0,overflowX:"hidden"}}>
      {/* <Navbar/> */}
      
        <LandingPage/>
      {/* <Login/> */}
    </div>
    </>
  )
}

export default App

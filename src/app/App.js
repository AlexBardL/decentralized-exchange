import './App.css'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { loadWeb3, loadAccount } from '../features/web3/web3Interactions'
import { loadToken } from '../features/token/tokenInteractions'
import { loadExchange } from '../features/exchange/exchangeInteractions'
import { selectTokenLoaded } from '../features/token/tokenSlice'
import { selectAccount } from '../features/web3/web3Slice'
import { selectExchangeLoaded } from '../features/exchange/exchangeSlice'

import Navbar from './components/Navbar'
import Content from './components/Content'


const App = () => {
   const dispatch = useDispatch()
   const account = useSelector(selectAccount)
   
   useEffect(() => {
      const init = async () => {
         const web3 = await loadWeb3(dispatch)
         await loadAccount(dispatch, web3, account)
         const networkId = await web3.eth.net.getId()
         await loadToken(web3, networkId, dispatch)
         await loadExchange(web3, networkId, dispatch)
      }
      init()
	}, [dispatch, account])
   
   const tokenLoaded = useSelector(selectTokenLoaded)
   const exchangeLoaded = useSelector(selectExchangeLoaded)
   
  
   return (
      <div>
         <Navbar />
         { tokenLoaded && exchangeLoaded 
            ? <Content /> 
            : <div className='content'></div> 
         }
      </div>
   )
}

export default App
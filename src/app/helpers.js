import { format, startOfHour } from 'date-fns'

export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
export const GREEN = 'success'
export const RED = 'danger'

const DECIMALS = (10**18) 

export const ether = (wei) => {
   if(wei) {
      return(wei / DECIMALS)
   }
}

export const tokens = ether

export const formatBalance = (balance) => {
   const precision = 100
   balance = ether(balance)
   balance = Math.round(balance * precision) / precision     // 2 decimal places
   return balance
}

export const formatTimestamp = (timestamp) => {
   return format(new Date(timestamp * 1000), 'HH:mm:ss, MM/d')
}

export const priceChartX = (timestamp) => {
   return startOfHour(new Date(timestamp * 1000))
}
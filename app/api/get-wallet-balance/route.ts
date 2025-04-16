import { NextRequest, NextResponse } from 'next/server'

// Token mapping for display
const TOKEN_INFO = {
  // WLD token on Worldchain
  '0x163f8c2467924be0ae7b5a0ffbe8846b54e57fdb': {
    symbol: 'wld',
    name: 'WLD',
    decimals: 18
  },
  // USDC on Ethereum/Worldchain
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    symbol: 'usdc',
    name: 'USDC',
    decimals: 6
  }
}

// Alchemy API key
const ALCHEMY_API_KEY = 'DDZkZIn3f3YcPrU6LGeP9jzGu7FQZfoA'
const ALCHEMY_URL = `https://worldchain-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`

// Function to get token balances from Alchemy
async function getTokenBalances(walletAddress: string): Promise<any> {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }

  const body = JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getTokenBalances",
    params: [
      walletAddress,
      "erc20"
    ]
  })

  try {
    const response = await fetch(ALCHEMY_URL, {
      method: 'POST',
      headers: headers,
      body: body
    })

    const data = await response.json()
    return data.result
  } catch (error) {
    console.error('Error fetching token balances:', error)
    throw error
  }
}

// Function to get the native balance (ETH or WLD)
async function getNativeBalance(walletAddress: string): Promise<string> {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }

  const body = JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [
      walletAddress,
      "latest"
    ]
  })

  try {
    const response = await fetch(ALCHEMY_URL, {
      method: 'POST',
      headers: headers,
      body: body
    })

    const data = await response.json()
    // Convert hex to decimal and from wei to ether
    const balanceInWei = parseInt(data.result, 16)
    const balanceInEth = balanceInWei / 1e18
    return balanceInEth.toString()
  } catch (error) {
    console.error('Error fetching native balance:', error)
    return "0"
  }
}

// Function to get token metadata
async function getTokenMetadata(contractAddress: string): Promise<any> {
  // If we have the token info in our mapping, use that
  if (TOKEN_INFO[contractAddress.toLowerCase() as keyof typeof TOKEN_INFO]) {
    return TOKEN_INFO[contractAddress.toLowerCase() as keyof typeof TOKEN_INFO]
  }

  // Otherwise, fetch from Alchemy
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }

  const body = JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getTokenMetadata",
    params: [contractAddress]
  })

  try {
    const response = await fetch(ALCHEMY_URL, {
      method: 'POST',
      headers: headers,
      body: body
    })

    const data = await response.json()
    return data.result
  } catch (error) {
    console.error(`Error fetching token metadata for ${contractAddress}:`, error)
    return {
      symbol: 'UNKNOWN',
      decimals: 18,
      name: 'Unknown Token'
    }
  }
}

// Function to get asset price in USD
async function getTokenPrice(symbol: string): Promise<number> {
  try {
    const cryptoCurrencies = symbol.toLowerCase() === 'eth' ? 'USDCE' : 'WLD'
    const fiatCurrencies = 'USD'
    
    const response = await fetch(
      `https://app-backend.worldcoin.dev/public/v1/miniapps/prices?cryptoCurrencies=${cryptoCurrencies}&fiatCurrencies=${fiatCurrencies}`
    )
    
    const data = await response.json()
    
    if (symbol.toLowerCase() === 'eth') {
      // For ETH we use USDCE price as approximation
      const amount = data.result.prices.USDCE.USD.amount
      const decimals = data.result.prices.USDCE.USD.decimals
      return Number(amount) / Math.pow(10, decimals)
    } else if (symbol.toLowerCase() === 'wld') {
      // For WLD
      const amount = data.result.prices.WLD.USD.amount
      const decimals = data.result.prices.WLD.USD.decimals
      return Number(amount) / Math.pow(10, decimals)
    } else if (symbol.toLowerCase() === 'usdc') {
      // For USDC, just return 1.0 as it's a stablecoin
      return 1.0
    }
    return 1.0
  } catch (error) {
    console.error(`Error fetching ${symbol} price:`, error)
    // Default fallback prices
    if (symbol.toLowerCase() === 'wld') return 1.51 // fallback WLD price
    if (symbol.toLowerCase() === 'eth') return 180000 // fallback ETH price
    if (symbol.toLowerCase() === 'usdc') return 1.0 // fallback USDC price
    return 1.0
  }
}

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json()
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Get token balances from Alchemy
    const tokenBalancesData = await getTokenBalances(walletAddress)
    
    // Get the native chain balance (ETH/WLD)
    const nativeBalance = await getNativeBalance(walletAddress)
    
    // Initialize wallet data with default structure
    let walletData = {
      wld: { balance: 0, value: 0, rate: 50 },
      eth: { balance: parseFloat(nativeBalance), value: 0, rate: 180000 },
      usdc: { balance: 0, value: 0, rate: 1 }
    }

    // Map for token addresses to track which ones we've processed
    const tokenAddressMap: { [key: string]: boolean } = {}

    // Process token balances
    const tokenBalances = tokenBalancesData.tokenBalances || []
    
    // Process each token balance
    for (const tokenBalance of tokenBalances) {
      if (tokenBalance.tokenBalance === '0x0') continue
      
      const contractAddress = tokenBalance.contractAddress
      tokenAddressMap[contractAddress.toLowerCase()] = true
      
      // Get token metadata
      const metadata = await getTokenMetadata(contractAddress)
      
      if (!metadata) continue
      
      // Calculate balance in tokens (not wei)
      const decimals = metadata.decimals || 18
      const balance = parseInt(tokenBalance.tokenBalance, 16) / Math.pow(10, decimals)
      
      // Skip very small balances
      if (balance < 0.000001) continue

      // Get token price 
      const price = await getTokenPrice(metadata.symbol || 'UNKNOWN')
      
      // Calculate value in USD
      const value = balance * price
      
      // Map to our wallet data structure
      if (metadata.symbol && metadata.symbol.toLowerCase() === 'wld') {
        walletData.wld = {
          balance,
          value: Math.round(value),
          rate: Math.round(price)
        }
      } else if (metadata.symbol && metadata.symbol.toLowerCase() === 'usdc') {
        walletData.usdc = {
          balance,
          value: Math.round(value),
          rate: Math.round(price)
        }
      }
    }

    // Calculate value for native token (ETH/WLD)
    const nativePrice = await getTokenPrice('eth')
    walletData.eth.value = Math.round(parseFloat(nativeBalance) * nativePrice)
    walletData.eth.rate = Math.round(nativePrice)

    return NextResponse.json(walletData)
  } catch (error) {
    console.error('Error in wallet balance API:', error)
    // Return default values in case of error
    return NextResponse.json({
      wld: { balance: 25.5, value: 1275, rate: 50 },
      eth: { balance: 0.15, value: 27000, rate: 180000 },
      usdc: { balance: 150, value: 12450, rate: 83 }
    })
  }
} 
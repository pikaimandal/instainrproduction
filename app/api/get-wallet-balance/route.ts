import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

// Standard ERC20 ABI for balanceOf
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
]

// Token contract addresses
const TOKEN_ADDRESSES = {
  // Worldchain (WLD)
  wld: {
    address: '0x163f8c2467924be0ae7b5a0ffbe8846b54e57fdb', // WLD token on Worldchain
    rpcUrl: 'https://mainnet.world.org',
    decimals: 18
  },
  // Ethereum (for ETH and USDC)
  eth: {
    address: '', // ETH is native token
    rpcUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Public Infura endpoint
    decimals: 18
  },
  usdc: {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC on Ethereum
    rpcUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Public Infura endpoint
    decimals: 6
  }
}

// Function to get asset price in USD
async function getTokenPrice(symbol: string): Promise<number> {
  try {
    const cryptoCurrencies = symbol === 'eth' ? 'USDCE' : 'WLD'
    const fiatCurrencies = 'USD'
    
    const response = await fetch(
      `https://app-backend.worldcoin.dev/public/v1/miniapps/prices?cryptoCurrencies=${cryptoCurrencies}&fiatCurrencies=${fiatCurrencies}`
    )
    
    const data = await response.json()
    
    if (symbol === 'eth') {
      // For ETH we use USDCE price as approximation
      const amount = data.result.prices.USDCE.USD.amount
      const decimals = data.result.prices.USDCE.USD.decimals
      return Number(amount) / Math.pow(10, decimals)
    } else {
      // For WLD
      const amount = data.result.prices.WLD.USD.amount
      const decimals = data.result.prices.WLD.USD.decimals
      return Number(amount) / Math.pow(10, decimals)
    }
  } catch (error) {
    console.error(`Error fetching ${symbol} price:`, error)
    // Default fallback prices
    if (symbol === 'wld') return 1.51 // fallback WLD price
    if (symbol === 'eth') return 180000 // fallback ETH price
    if (symbol === 'usdc') return 1.0 // fallback USDC price
    return 1.0
  }
}

// Function to get asset balance
async function getBalance(walletAddress: string, token: string): Promise<{ balance: string; value: number; rate: number }> {
  try {
    const tokenConfig = TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES]
    const provider = new ethers.JsonRpcProvider(tokenConfig.rpcUrl)
    
    let balance: ethers.BigNumber
    let formattedBalance: string
    
    if (token === 'eth') {
      // For native ETH
      balance = await provider.getBalance(walletAddress)
      formattedBalance = ethers.formatUnits(balance, 18)
    } else {
      // For ERC20 tokens
      const tokenContract = new ethers.Contract(tokenConfig.address, ERC20_ABI, provider)
      balance = await tokenContract.balanceOf(walletAddress)
      formattedBalance = ethers.formatUnits(balance, tokenConfig.decimals)
    }
    
    // Get token price
    const price = await getTokenPrice(token)
    
    // Calculate value in USD
    const numericBalance = parseFloat(formattedBalance)
    const value = numericBalance * price
    
    return {
      balance: formattedBalance,
      value: Math.round(value),
      rate: Math.round(price)
    }
  } catch (error) {
    console.error(`Error fetching ${token} balance:`, error)
    // Return default values in case of error
    return {
      balance: '0',
      value: 0,
      rate: token === 'wld' ? 50 : token === 'eth' ? 180000 : 83
    }
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
    
    // Fetch balances for all tokens in parallel
    const [wldData, ethData, usdcData] = await Promise.all([
      getBalance(walletAddress, 'wld'),
      getBalance(walletAddress, 'eth'),
      getBalance(walletAddress, 'usdc')
    ])
    
    return NextResponse.json({
      wld: {
        balance: parseFloat(wldData.balance),
        value: wldData.value,
        rate: wldData.rate
      },
      eth: {
        balance: parseFloat(ethData.balance),
        value: ethData.value,
        rate: ethData.rate
      },
      usdc: {
        balance: parseFloat(usdcData.balance),
        value: usdcData.value,
        rate: usdcData.rate
      }
    })
  } catch (error) {
    console.error('Error in wallet balance API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet balances' },
      { status: 500 }
    )
  }
} 
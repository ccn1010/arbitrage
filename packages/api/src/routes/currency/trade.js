// const BigNumber = require('bignumber.js')
const { Route, FeeAmount, Trade } = require('@uniswap/v3-sdk')
const { Token, CurrencyAmount, TradeType } = require('@uniswap/sdk-core')
const JSBI = require('jsbi')
const {
  abi: UniswapAbi,
} = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')
const UNISWAP = require('@uniswap/sdk')

const { ethers } = require('ethers')
const getPool = require('./uniswapPool')
// const sol = require('@ethersproject/solidity')
// const addr = require('@ethersproject/address')
// const request = require('../../lib/request')
// const getDexPrice = require('../../lib/graph/dex/get-price')

// const getPrice = async (symbol) => {
//   const data = await request({
//     url: `https://api.binance.com/api/v3/ticker/bookTicker?symbol=${symbol}`,
//     method: 'GET',
//   }).then((resp) => resp.data)

//   return data
// }

// const getPriceBlockchain = async (symbol) => {
//   const data = await request({
//     url: `https://api.blockchain.com/v3/exchange/l2/${symbol}`,
//     method: 'GET',
//   }).then((resp) => resp.data)
//   console.log('data', data)

//   return {
//     bidPrice: data.bids[0].px,
//     askPrice: data.asks[0].px,
//   }
// }

// const getPriceBitfinex = async (symbol) => {
//   const data = await request({
//     url: `https://api-pub.bitfinex.com/v2/ticker/t${symbol}`,
//     method: 'GET',
//   }).then((resp) => resp.data)
//   console.log('data', data)

//   return [{
//     bidPrice: data[0],
//     askPrice: data[2],
//   }, 1 - 0.0007]
// }

// const getPriceKraken = async (symbol) => {
//   const data = await request({
//     url: `https://api.kraken.com/0/public/Ticker?pair=${symbol}`,
//     method: 'GET',
//   }).then((resp) => resp.data.result)
//   console.log('data', data)

//   return [{
//     bidPrice: data[0],
//     askPrice: data[2],
//   }, 1 - 0.0007]
// }

// const getPriceUniswap = async (symbol) => {
//   const data = await getDexPrice(symbol)
//   const price = BigNumber(data._reserve0).dividedBy(data._reserve1).toString()

//   return [{
//     bidPrice: price,
//     askPrice: price,
//   }, 1 - 0.0005]
// }

const provider = new ethers.providers.WebSocketProvider('wss://mainnet.infura.io/ws/v3/e9680c370f374ef4bad3f5f654317e9a')

const doTrade = async (inputToken, routePath) => {
  const amountIn = new UNISWAP.TokenAmount(inputToken, '10000000')

  // console.log('routerouteroute', JSON.stringify(routePath, null, 2))
  routePath.forEach((item) => {
    // console.log('PAIR', item.token0, item.reserve1)
    const token = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, item.token0.address, item.token0.decimals)
    const amount = new UNISWAP.TokenAmount(token, '1000')
    console.log('PAIR', item.reserve0, item.reserve1, item.getOutputAmount(amount))
  })
  const route = new UNISWAP.Route(routePath, inputToken)
  // console.log('ROUTE', JSON.stringify(route.pairs, null, 2))

  console.log(route.midPrice.toSignificant(6)) // 201.306
  console.log(route.midPrice.invert().toSignificant(6))

  const trade = new UNISWAP.Trade(route, amountIn, UNISWAP.TradeType.EXACT_INPUT)
  const slippageTolerance = new UNISWAP.Percent('50', '10000')
  const ret = {
    inputAmount: trade.inputAmount.toFixed(),
    outputAmount: trade.outputAmount.toFixed(),
    minimumAmountOut: trade.minimumAmountOut(slippageTolerance).toFixed(),
  }

  return ret
}

// module.exports = async (req) => {
//   const { path } = req.body

//   const routePathPromise = path.map((p) => {
//     const tokenFrom = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, p.parentToken.id, p.parentToken.decimals)
//     const tokenTo = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, p.toToken.id, p.toToken.decimals)
//     const pairArray = p.isReverse ? [tokenTo, tokenFrom] : [tokenFrom, tokenTo]
//     const pair = UNISWAP.Fetcher.fetchPairData(...pairArray, provider)
//     return pair
//   })

//   // const routePathPromise = []

//   // for (const p of path) {
//   //   // const tokenPair = p.isReverse ? [p.toToken.id, p.parentToken.id] : [p.parentToken.id, p.toToken.id];
//   //   // const pair = addr.getCreate2Address(
//   //   //   UNISWAP.FACTORY_ADDRESS,
//   //   //   sol.keccak256(['bytes'], [sol.pack(['address', 'address'], tokenPair)]),
//   //   //   UNISWAP.INIT_CODE_HASH
//   //   // );
//   //   const tokenFrom = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, p.parentToken.id, parseInt(p.parentToken.decimals))
//   //   const tokenTo = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, p.toToken.id, parseInt(p.toToken.decimals))
//   //   const pairArray = p.isReverse ? [tokenTo, tokenFrom] : [tokenFrom, tokenTo]
//   //   const pair = UNISWAP.Fetcher.fetchPairData(...pairArray, provider)
//   //   routePathPromise.push(pair)
//   // }
//   const routePath = await Promise.all(routePathPromise)

//   const firstToken = path[0].parentToken
//   const inputToken = new UNISWAP.Token(UNISWAP.ChainId.MAINNET, firstToken.id, parseInt(firstToken.decimals, 10))
//   console.log('================== BEGIN')
//   const amountIn = new UNISWAP.TokenAmount(inputToken, '100')

//   const trades = UNISWAP.Trade.bestTradeExactIn(routePath, amountIn, inputToken)
//   console.log('========== LEN', trades.length)
//   trades.forEach((trade) => {
//     console.log('============= TRADE', trade.executionPrice, trade.outputAmount)
//   })
//   // console.log('========trades', JSON.stringify(trades, null, 2))

//   // const ret1 = await doTrade(inputToken, routePath)
//   // console.log('=========== RESULT1', ret1)
//   // const ret2 = await doTrade(inputToken, routePath.reverse())
//   // console.log('=========== RESULT2', ret2)
//   //   getPrice()
//   return {}
// }

const generateContract = (address, abi) => {
  const contract = new ethers.Contract(address, abi, provider)
  return contract
}

// uniswap-v3 trade
module.exports = async (req) => {
  const { path } = req.body
  const pools = []

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < path.length; i++) {
    const p = path[i]
    const tokenFrom = new Token(UNISWAP.ChainId.MAINNET, p.parentToken.id, parseInt(p.parentToken.decimals, 10))
    const tokenTo = new Token(UNISWAP.ChainId.MAINNET, p.toToken.id, parseInt(p.toToken.decimals, 10))
    const poolContract = generateContract(p.symbol, UniswapAbi)
    // eslint-disable-next-line no-await-in-loop
    const pool = await (p.isReverse ? getPool(poolContract, tokenTo, tokenFrom, parseInt(p.fee, 10))
      : getPool(poolContract, tokenFrom, tokenTo, parseInt(p.fee, 10)))
    pools.push(pool)
  }

  const firstToken = path[0].parentToken
  const inputToken = new Token(UNISWAP.ChainId.MAINNET, firstToken.id, parseInt(firstToken.decimals, 10))

  const result = await Trade.bestTradeExactIn(
    pools,
    CurrencyAmount.fromRawAmount(inputToken, JSBI.BigInt(100)),
    inputToken,
    { maxHops: 5 },
  )

  // console.log('rrrrrrrrrr', result)
  console.log('================== RESULT')
  result.forEach((item) => {
    console.log('ret', item.outputAmount.divide(item.inputAmount))
  })
  return {}
}

// module.exports = async (req, res) => {
//     let balance = BigNumber(100);
//     const { path } = req.body;
//     for(let p of path) {
//         const [data, fee] = await getPriceUniswap(p.symbol);
//         let price = BigNumber(data.bidPrice);
//         if(p.isReverse){
//             price = BigNumber(1).dividedBy(data.askPrice);
//         }
//         balance = balance.multipliedBy(price).multipliedBy(fee);
//         console.log('ppppppp', data, p.symbol, p.isReverse)
//     }
//   console.log('balancebalancebalance', balance.toString())
// //   getPrice()
// return {};
// }

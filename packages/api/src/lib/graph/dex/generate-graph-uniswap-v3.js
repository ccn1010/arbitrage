const BigNumber = require('bignumber.js')
const { getPools } = require('./scan-factory-v3')

module.exports = async (logger) => {
  logger.info('attempting to create graph')
  const finalPools = []
  const pools = await getPools()
  // const one = BigNumber(1);
  // const zero = BigNumber(0)

  pools.forEach((item) => {
    // console.log('itemitemitem', item)
    // if (item.weight.isEqualTo(zero)) {
    //   return
    // }
    finalPools.push({
      from: item.token0.id,
      to: item.token1.id,
      fromToken: {
        ...item.token0,
        price: item.token0Price,
      },
      toToken: {
        ...item.token1,
        price: item.token1Price,
      },
      weight: BigNumber(item.token0Price),
      symbol: item.id,
      liquidity: item.liquidity,
    })
    finalPools.push({
      to: item.token0.id,
      from: item.token1.id,
      fromToken: {
        ...item.token1,
        price: item.token1Price,
      },
      toToken: {
        ...item.token0,
        price: item.token0Price,
      },
      // weight: BigNumber(1).dividedBy(item.token0Price),
      weight: BigNumber(item.token1Price),
      isReverse: true,
      symbol: item.id,
      liquidity: item.liquidity,
    })

    // console.log('wwwwww', item.id, BigNumber(item.token0Price).toString(), BigNumber(item.token1Price).toString())
  })

  // console.log('vvvvv', finalSymbols)

  const nodeMap = {}
  finalPools.forEach((pool) => {
    let list = nodeMap[pool.from]
    if (!list) {
      list = []
      nodeMap[pool.from] = list
    }

    const index = list.findIndex((item) => item.to === pool.to)
    // v3 有重复的情况 交易对重复出现
    // if (dest && symbol.isReverse) {
    const dest = list[index]
    if (index !== -1) {
      console.log('dest', dest, pool)
    }
    if (index !== -1 && pool.weight.isGreaterThan(dest.weight)) {
      list[index] = pool
      return
    }
    list.push(pool)
  })

  return nodeMap
}

const Joi = require('@hapi/joi')

const findCycles = require('../../lib/cycles/find-cycles')
const subCycles = require('../../lib/cycles/sub-cycles')
// const generateGraph = require('../../lib/graph/generate-graph')
// const generateGraph = require('../../lib/graph/generate-graph-binance')
// const generateGraph = require('../../lib/graph/generate-graph-blockchain')
// const generateGraph = require('../../lib/graph/generate-graph-bitfinex')
// const generateGraph = require('../../lib/graph/generate-graph-kraken')
const generateGraph = require('../../lib/graph/dex/generate-graph-uniswap')
// const generateGraph = require('../../lib/graph/generate-graph-eth')

const findOptimalRoutes = (cycles, currency, filterByCurrency) => {
  const dp = {}
  return cycles
    .filter(({ path, profit }) => {
      if (filterByCurrency && path[0].parent !== currency) return false
      if (dp[`${profit}: ${path.length}`]) return false
      dp[`${profit}: ${path.length}`] = 1
      return true
    })
    .sort((a, b) => (b.profit / b.path.length) - (a.profit / a.path.length))
}

const schema = Joi.object({
  currency: Joi.string().optional().allow(''),
  filterByCurrency: Joi.boolean().optional(),
})

let graph = {}
let day
let cycles = []
let sub = []

module.exports = async (req, res) => {
  const {
    logger,
    body,
  } = req

  try {
    Joi.assert(body, schema)

    const {
      currency,
      filterByCurrency,
    } = body

    const today = new Date().getDay()
    // if (today === day) {
    //   logger.info('graph and cycle already exists in cache, returning caches values')

    //   return res.json({
    //     success: true,
    //     data: {
    //       cycles: findOptimalRoutes(sub, currency, filterByCurrency),
    //     },
    //   })
    // }

    logger.info('renewing graph and cycles')

    graph = await generateGraph(logger)
    // console.log('graph', graph)
    cycles = Object.keys(graph)
    .filter((item)=>{
      console.log('item', item)
      // return item.includes('US') || item.includes('BTC') || item.includes('ETH') || item.includes('BNB')
      return item.toUpperCase().includes('USD') || item.toUpperCase().includes('DAI')
    })
    .map((coin) => findCycles(graph, coin))
    // console.log('cycles', cycles)
    sub = cycles.map(({ path }) => subCycles(graph, path)).reduce((prev, curr) => [...prev, ...curr], [])
    day = today

    return res.json({
      success: true,
      data: {
        cycles: findOptimalRoutes(sub, currency, filterByCurrency),
      },
    })
  } catch (e) {
    logger.error({ stack: e.stack }, `error with route ${req.url}`, { message: e.message })

    return res.status(500).json({
      success: false,
    })
  }
}

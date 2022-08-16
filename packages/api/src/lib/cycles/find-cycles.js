const { cloneDeep } = require('lodash')
const checkCycles = require('./check-cycles')

module.exports = (graph, start) => {
  // deep copy nodes
  const nodes = cloneDeep(graph)

  // initializaion of parent and dist dicts
  const pre = {}
  const dist = {}

  Object.keys(nodes).forEach((node) => {
    dist[node] = -Infinity
    pre[node] = []
  })

  dist[start] = 1
  pre[start] = [{
    parent: start,
  }]

  // edges initialization
  const edges = nodes[start]

  // clear nodes[]
  nodes[start] = []

  // console.log('edges', edges)
  // starting algorithms
  while (edges.length) {
    const edge = edges.pop()
    const {
      to, from, weight, isReverse, symbol,
      fromToken, toToken,
    } = edge

    // console.log('edge', edge)

    const dw = weight.multipliedBy(dist[from]);
    if (dist[to] < dw) {
      dist[to] = dw
      pre[to].push({
        parent: from,
        parentToken: fromToken,
        to,
        toToken: toToken,
        symbol,
        isReverse,
      })
    }
    edges.unshift(...(nodes[to] || []))
    nodes[to] = []
  }
  // console.log('prepreprepreprepre', pre)

  // starting to try and reconstact path
  let parent = pre[start].pop()

  // return nothing if no path
  if (parent.parent === start) {
    return {
      path: [],
      profit: 0,
    }
  }

  // reconstacting path
  const path = [parent]
  // console.log('==================', path, pre)
  // TODO 这里加个逻辑，就是 busd usdt 这种可以互换 parent.parent !== start || parent.parent !== like start
  while (parent.parent !== start) {
    parent = pre[parent.parent].pop()
    // console.log('parent', parent)
    path.unshift(parent)
    if(!parent){
      return {
        path: [],
        profit: 0,
      }
    }
  }

  return {
    path,
    profit: checkCycles(graph, path),
  }
}

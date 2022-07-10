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
      to, from, weight, bank,
    } = edge

    if (dist[to] < (dist[from] * weight)) {
      dist[to] = (dist[from] * weight)
      pre[to].push({
        parent: from,
        to,
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
  while (parent.parent !== start) {
    parent = pre[parent.parent].pop()
    path.unshift(parent)
  }

  return {
    path,
    profit: checkCycles(graph, path),
  }
}

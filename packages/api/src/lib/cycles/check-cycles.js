const BigNumber = require('bignumber.js');

module.exports = (graph, cycle) => {
  // console.log('cyclecyclecycle', cycle)
  // initializing profit to 1
  // let profit = 1
  let profit = BigNumber(1)

  // going through the path to find out the cycles profit
  cycle.forEach(({ parent, to }) => {
    const { weight } = graph[parent].find((element) => element.to === to) || { weight: 0 }
    // profit *= weight
    profit = profit.multipliedBy(weight)
    // profit = weight.multipliedBy(profit)
  })

  // returning profit
  return profit.minus(1).multipliedBy(100).toString();
  // return profit.minus(1).multipliedBy(100)
}

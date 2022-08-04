const path = require('path');
const jsonfile = require('jsonfile')
const { request, gql } = require('graphql-request')

const pairCounts = require('../../../../data/factories/pair-counts.js');

const getPairs = async (pairPath) => {
  const endpoint = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'

  const query = gql`
  query getPairs($volumeUSD: String!){
    pairs(where: {volumeUSD_gt: $volumeUSD}, orderBy: reserveUSD, orderDirection: desc) {
      id
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      reserveUSD
      volumeUSD
    }
  }
  `

  const data = await request(endpoint, query, {
    volumeUSD: '1000000'
  })

  jsonfile.writeFile(pairPath, data, { spaces: 2 })
}

module.exports = async () => {
    const factoryPair = pairCounts.find((p) => p.name === 'uni');
    const pairPath = path.resolve(
      './data/pairs/',
      `${factoryPair.network}`,
      `${factoryPair.name}.json`
    );

    console.log(pairPath);

    getPairs(pairPath);
}

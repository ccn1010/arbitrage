const path = require('path')
// const jsonfile = require('jsonfile')
const { request, gql } = require('graphql-request')

const pairCounts = require('../../../../data/factories/pair-counts.js')

// const getPairs = async (pairPath) => {
//   const endpoint = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'

//   const query = gql`
//   query getPools($volumeUSD: String!){
//     {
//       pools(where: {volumeUSD_gt: $volumeUSD, liquidity_not: 0}, orderBy: volumeUSD, orderDirection: desc) {
//         id
//         sqrtPrice
//         token0Price
//         token1Price
//         liquidity
//         token0 {
//           id
//           symbol
//           name
//           decimals
//         }
//         token1 {
//           id
//           symbol
//           name
//           decimals
//         }
//         volumeUSD
//       }
//     }
//   }
//   `

//   const data = await request(endpoint, query, {
//     volumeUSD: '1000000',
//   })

//   jsonfile.writeFile(pairPath, data, { spaces: 2 })
// }

const getPools = async () => {
  const endpoint = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'

  const query = gql`
    {
      pools(where: {volumeUSD_gt: 1000000, liquidity_not: 0}, orderBy: volumeUSD, orderDirection: desc) {
        id
        sqrtPrice
        token0Price
        token1Price
        feeTier
        token0 {
          id
          symbol
          name
          decimals
        }
        token1 {
          id
          symbol
          name
          decimals
        }
        volumeUSD
      }
    }
  `

  // const query = gql`
  // query getPools($volumeUSD: String!){
  //   {
  //     pools(where: {volumeUSD_gt: $volumeUSD}, orderBy: volumeUSD, orderDirection: desc) {
  //       id
  //       sqrtPrice
  //       token0Price
  //       token1Price
  //       token0 {
  //         id
  //         symbol
  //         name
  //         decimals
  //       }
  //       token1 {
  //         id
  //         symbol
  //         name
  //         decimals
  //       }
  //       volumeUSD
  //     }
  //   }
  // }
  // `

  const data = await request(endpoint, query, {
    volumeUSD: '1000000',
  })

  console.log('ddddd', data)

  return data.pools
}

// module.exports = async () => {
//   const factoryPair = pairCounts.find((p) => p.name === 'uni')
//   const pairPath = path.resolve(
//     './data/pairs/',
//     `${factoryPair.network}`,
//     `${factoryPair.name}.json`,
//   )

//   await getPairs(pairPath)
// }

module.exports = {
  getPools,
}

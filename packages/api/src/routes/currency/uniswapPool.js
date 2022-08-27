const {
  Pool, encodeSqrtRatioX96, nearestUsableTick, TICK_SPACINGS, TickMath,
} = require('@uniswap/v3-sdk')
const JSBI = require('jsbi')

const getPoolState = async (
  poolContract,
  fee,
) => {
  const minTick = nearestUsableTick(
    TickMath.MIN_TICK,
    TICK_SPACINGS[fee],
  )
  const maxTick = nearestUsableTick(
    TickMath.MAX_TICK,
    TICK_SPACINGS[fee],
  )
  const poolData = await Promise.all([
    poolContract.liquidity(),
    poolContract.slot0(),
    poolContract.ticks(minTick),
    poolContract.ticks(maxTick),
  ])

  console.log('poolData', fee, poolData[2], poolData[3])

  return {
    liquidity: poolData[0],
    sqrtPriceX96: poolData[1][0],
    tick: poolData[1][1],
    observationIndex: poolData[1][2],
    observationCardinality: poolData[1][3],
    observationCardinalityNext: poolData[1][4],
    feeProtocol: poolData[1][5],
    unlocked: poolData[1][6],
    fee,
    tickProvider: [
      {
        index: minTick,
        liquidityNet: poolData[2][1],
        liquidityGross: poolData[2][0],
      },
      {
        index: maxTick,
        liquidityNet: poolData[3][1],
        liquidityGross: poolData[3][0],
      },
    ],
  }
}

module.exports = async (poolContract, tokenA, tokenB, fee, isReverse) => {
  const poolData = await getPoolState(poolContract, fee, isReverse)

  const pool = new Pool(
    tokenA,
    tokenB,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick,
    poolData.tickProvider,
  )
  return pool
}

// export const getPool = async (poolContract, tokenA, tokenB, fee) => {
//   // find the pool state in order to generate a new pool
//   const [liquidity, slot] = await Promise.all([
//     poolContract.liquidity(),
//     poolContract.slot0(),
//   ]);

//   const state = {
//     liquidity,
//     sqrtPriceX96: slot[0],
//     tick: slot[1],
//     observationIndex: slot[2],
//     observationCardinality: slot[3],
//     observationCardinalityNext: slot[4],
//     feeProtocol: slot[5],
//     unlocked: slot[6],
//   };

//   // const sqrtRatioX96 = encodeSqrtRatioX96(tokenA.quotient, tokenB.quotient)

//   // new pool
//   const pool = new Pool(
//     tokenA,
//     tokenB,
//     fee,
//     state.sqrtPriceX96.toString(),
//     state.liquidity.toString(),
//     state.tick,
//     // TickMath.getTickAtSqrtRatio(sqrtRatioX96),
//       // [
//       //   {
//       //     index: nearestUsableTick(TickMath.MIN_TICK, TICK_SPACINGS[fee]),
//       //     liquidityNet: liquidity,
//       //     liquidityGross: liquidity
//       //   },
//       //   {
//       //     index: nearestUsableTick(TickMath.MAX_TICK, TICK_SPACINGS[fee]),
//       //     liquidityNet: JSBI.multiply(liquidity, JSBI.BigInt(-1)),
//       //     liquidityGross: liquidity
//       //   }
//       // ]
//   );

//   console.log('state.tick', state.tick, pool)

//   return pool;
// };

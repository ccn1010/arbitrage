const { getAddress } = require("@ethersproject/address");
const {
  ChainId,
  Token,
  Fetcher,
  Route,
  Pair,
  Trade,
  TokenAmount,
  TradeType,
} = require("@uniswap/sdk");
const UniswapV2FactoryContract = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const UniswapV2PairContract = require("@uniswap/v2-core/build/UniswapV2Pair.json");
const { Graph } = require("graphlib");
const { range } = require("transducist");
const Web3 = require("web3");
const runConcurrently = require("../trading/async");

const UNISWAP_FACTORY_ADDRESS =
  "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

class UniswapTradingPairsGraph {
  uniswapFactory;
  uniswapTradingGraph;
  web3;

  constructor(web3) {
    this.web3 = web3;
    this.uniswapFactory = new this.web3.eth.Contract(
      UniswapV2FactoryContract.abi,
      UNISWAP_FACTORY_ADDRESS,
    );
    this.uniswapTradingGraph = new Graph({ directed: false, multigraph: true });
  }

  async createGraph() {
    const allPairsLength = +(await this.uniswapFactory.methods
      .allPairsLength()
      .call());
    console.log(
      `There are ${allPairsLength} tradable pairs, but we will only get the first 1000 for the sake of time. Can you cache the results to speed things up next time?`,
    );
    const allPairs = await runConcurrently(
      [...range(0, 100)],
      this.fetchTokenPairNoThrow.bind(this),
      { maxConcurrency: 16 },
    );
    allPairs.forEach((pair) => {
      if (pair) {
        this.uniswapTradingGraph.setEdge(
          getAddress(pair.token0),
          getAddress(pair.token1),
          getAddress(pair.tokenPairAddress),
        );
      }
    });
    console.log("You can choose = require(the following assets:");
    console.log(this.uniswapTradingGraph.nodes());

    return allPairs;
  }

  async fetchTokenPairNoThrow(
    pairIndex,
  ) {
    try {
      return await this.fetchTokenPair(pairIndex);
    } catch (error) {
      console.error(`Failed to fetch token pair at index ${pairIndex}`, error);
      return undefined;
    }
  }

  async fetchTokenPair(pairIndex) {
    const tokenPairAddress = await this.uniswapFactory.methods
      .allPairs(pairIndex)
      .call();
    const uniswapPair = new this.web3.eth.Contract(
      UniswapV2PairContract.abi,
      tokenPairAddress,
    );
    const token0 = await uniswapPair.methods.token0().call();
    const token1 = await uniswapPair.methods.token1().call();
    return { tokenPairAddress, token0, token1 };
  }
}

module.exports = async () => {
  const web3 = new Web3(new Web3.providers.WebsocketProvider(
    'wss://mainnet.infura.io/ws/v3/e9680c370f374ef4bad3f5f654317e9a',
  ));
  const ut = new UniswapTradingPairsGraph(web3);
  const pairs = await ut.createGraph();
  console.log('ppppppppppp', pairs)
}

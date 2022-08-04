const Web3 = require('web3');
const util = require('util');
const fs = require('fs');
const env = require('dotenv').config();
const path = require('path');
const axios = require('axios');
const jsonfile = require('jsonfile')

const pairCounts = require('../../../../data/factories/pair-counts.js');
const erc20abi = require('./constants/abi/erc-20-abi.js');
const pairAbi = require('./constants/abi/pair-abi.js');
const factoryAbi = require('./constants/abi/factory-abi.js');

const pairCountPath = path.resolve(
  './data/factories/pair-counts.js'
);



let web3;
let factory;
let pairPath;
let factoryPair;
const cacheMap = new Map();

const setRPCandFactory = async (net, add) => {
  try {
    let rpc;

    if (net === 'eth') {
      rpc = env.parsed.ETHEREUM_RPC;
    } else if (net === 'bsc') {
      rpc = env.parsed.BSC_RPC;
    } else if (net === 'matic') {
      rpc = env.parsed.MATIC_RPC;
    } else if (net === 'ftm') {
      rpc = env.parsed.FANTOM_PRC;
    } else if (net === 'xdai') {
      rpc = env.parsed.XDAI_RPC;
    } else if (net === 'heco') {
      rpc = env.parsed.HECO_RPC;
    } else if (net === 'arbi') {
      rpc = env.parsed.ARBITRUM_RPC;
    }

    web3 = new Web3(rpc);
    factory = new web3.eth.Contract(factoryAbi, add);
  } catch (e) {
    console.log(`error on setRPC: ${e}`);
  }
};

const getExchangeMap = async () => {
  const response = await axios.get('https://pro-api.coinmarketcap.com/v1/exchange/map', {
      headers: {
        'X-CMC_PRO_API_KEY': '93550950-ebb3-48ee-830a-f3bc1980d6b7',
      },
    });

  console.log('rrrrrrrrrr', response.data.data)
  jsonfile.writeFile('/tmp/data.json', response.data.data)
}

const getPairs = async (pairPath) => {
  const response = await axios.get('https://api.coinmarketcap.com/data-api/v3/exchange/market-pairs/latest?slug=uniswap-v3&category=spot&start=1&limit=1000', {
    });

  const marketPairs = response.data.data.marketPairs;
  const pairs = marketPairs.filter(item=>{
    console.log('item.volumeUsd', item.volumeUsd, item.volumeUsd > 10**7)
    return item.volumeUsd > 10**7;
  })
  // console.log('eeeeeeeeee', pairs)
  jsonfile.writeFile(pairPath, pairs, { spaces: 2 })
}

const getData = async (address) => {
  if(cacheMap.get(address)){
    return cacheMap.get(address);
  }

  const response = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${'ethereum'}/contract/${address}`
  );
  const item = response.data;
  cacheMap.set(item);
  return item;
};

const getTokens = async (num, pair, tkn0, tkn1) => {
  const token0 = await getData(tkn0);
  const token1 = await getData(tkn1);
  const obj = {
    index: num,
    id: pair,
    token0: {
      id: tkn0,
      name: token0.name,
      market_cap_rank: token0.market_cap_rank,
      coingecko_rank: token0.coingecko_rank,
      market_cap: token0.market_data.market_cap.usd,
    },
    token1: {
      id: tkn1,
      name: token1.name,
      market_cap_rank: token1.market_cap_rank,
      coingecko_rank: token1.coingecko_rank,
      market_cap: token1.market_data.market_cap.usd,
    },
  };

  console.log('objobjobjobjobj', obj)

  const padding = ' '.repeat(2);

  const formatted = util
    .inspect(obj, {
      compact: false,
      depth: 2,
      breakLength: 80,
    })
    .replace(/\n/g, `\n${padding}`);

  appendFile(pairPath, `\n${padding}${formatted},`);
};

const getPair = async (num) => {
  const pairAddress = await factory.methods.allPairs(num).call();

  const pair = new web3.eth.Contract(pairAbi, pairAddress);

  const token0 = await pair.methods.token0().call();
  const token1 = await pair.methods.token1().call();

  return getTokens(num, pairAddress, token0, token1);
};

const checkPairCount = async () => {
  try {
    let count = await factory.methods.allPairsLength().call();
    return count;
  } catch (e) {
    console.log(`error on checkPairCount: ${e}`);
  }
};

const appendFile = (file, content) => {
  fs.appendFile(file, content, 'utf-8', (e) => {
    if (e) {
      console.error(e);
      return;
    }
  });
};

const readFileAndTrim = (file) => {
  fs.readFile(file, 'utf-8', (e, data) => {
    if (e) {
      console.log(`error on readFile in readFileAndTrim: ${e}`);
      return;
    }
    let linesExceptFirst = data.replace('\n];\n', '');
    fs.writeFile(file, linesExceptFirst, 'utf-8', (e) => {
      if (e) {
        console.log(`error on writeFile in readFileAndTrim: ${e}`);
        return;
      }
    });
  });
};

const evaluateFile = (file, count) => {
  if (count > 0) {
    readFileAndTrim(file);
    return;
  } else {
    fs.writeFile(file, `module.exports = [`, 'utf-8', (e) => {
      if (e) {
        console.log(`error on evaluateFile: ${e}`);
        return;
      }
    });
  }
};

const updatePairCount = (newCount) => {
  let index = pairCounts.findIndex((n) => n.name === factoryPair.name);

  pairCounts[index].count = Number(newCount);

  let formatted = util.inspect(pairCounts, {
    compact: false,
    depth: 2,
    breakLength: 80,
    maxArrayLength: null,
  });

  fs.writeFile(pairCountPath, `module.exports = ${formatted}`, 'utf-8', (e) => {
    if (e) {
      console.log(`error on updatePairCount: ${e}`);
      return;
    }
  });
};

module.exports = async () => {
    factoryPair = pairCounts.find((p) => p.name === 'uni');
    pairPath = path.resolve(
      './data/pairs/',
      `${factoryPair.network}`,
      `${factoryPair.name}.js`
    );

    console.log(pairPath);

    await setRPCandFactory(factoryPair.network, factoryPair.address);

    // const max = await checkPairCount();

    // cacheMap.clear();
    // evaluateFile(pairPath, 0);
    
    // for(let i = 0; i < max; i++) {
    //   await getPair(i);
    // }
    // evaluateFile(pairPath, max - 1);
    // updatePairCount(max - 1);

    getPairs(pairPath);
}

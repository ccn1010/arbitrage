const Web3 = require('web3');
const util = require('util');
const env = require('dotenv').config();
const path = require('path');
const BigNumber = require('bignumber.js');

const pairCounts = require('../../../../data/factories/pair-counts.js');
const pairAbi = require('./constants/abi/pair-abi.js');

let data;
let web3;

const setRPC = async (chain) => {
  try {
    let rpc;

    if (chain === 'eth') {
      rpc = env.parsed.ETHEREUM_RPC;
    } else if (chain === 'bsc') {
      rpc = env.parsed.BSC_RPC;
    } else if (chain === 'matic') {
      rpc = env.parsed.MATIC_RPC;
    } else if (chain === 'ftm') {
      rpc = env.parsed.FANTOM_PRC;
    } else if (chain === 'xdai') {
      rpc = env.parsed.XDAI_RPC;
    } else if (chain === 'heco') {
      rpc = env.parsed.HECO_RPC;
    } else if (chain === 'arbi') {
      rpc = env.parsed.ARBITRUM_RPC;
    }

    web3 = new Web3(rpc);
    return;
  } catch (e) {
    console.error(`error on setRPC: ${e}`);
  }
};

const getReserves = async (from, to) => {
  const total = to - from;
  const result = new Array(total);
    const batch = new web3.BatchRequest();
    let counter = 0;
    await new Promise(function(resolve, reject){
      for(let i = from; i < to; i++){
        const pair = data[i];
        console.log('ppppp', pair)
        const address = pair.id;
        const index = i - from;
        const contract = new web3.eth.Contract(pairAbi, address);
        batch.add(contract.methods.getReserves().call.request((err, data)=>{
          if (err) {
            return;
          }
          // console.log('dddddddddd', index, data)
          counter++;
          result[index] = {
            from: pair.token0.id,
            to: pair.token1.id,
            fromToken: pair.token0,
            toToken: pair.token1,
            weight: BigNumber(data._reserve0).dividedBy(data._reserve1),
            symbol: pair.id,
          };

          if(counter === total){
            resolve();
          }
        }));
      }

      batch.execute();
    });

  return result;
};

module.exports = async () => { 
  const mode = 'uni';
  let max = 0;
  for (let i = 0; i < pairCounts.length; i++) {
    if (mode === pairCounts[i].name) {
      const network = pairCounts[i].network;
      const pairPath = path.resolve(
        './data/pairs/',
        `${network}`,
        `${mode}.json`
      );
      data = require(pairPath).pairs;
      message = `checking ${data.length} ${mode}swap pairs...`;
      console.log(message)
      setRPC(network);

      max = data.length;
      break;
    }
  }

  const list = [];
  let from = 0;
  while(true){
    let to = from + 200;
    to = Math.min(max, to);
    const res = await getReserves(from, to);
    list.push(...res);
    from = to;
    if(from === max){
      break;
    }
  }

  // console.log('listlistlist', list)
  return list;
}

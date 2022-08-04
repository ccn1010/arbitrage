const Web3 = require('web3');
const env = require('dotenv').config();

const pairAbi = require('./constants/abi/pair-abi.js');

const getWeb3 = (chain) => {
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

    return new Web3(rpc);
};

module.exports = async (address) => {
    const web3 = getWeb3('eth');
    const contract = new web3.eth.Contract(pairAbi, address);
    const res = await contract.methods.getReserves().call();
  return res;
};
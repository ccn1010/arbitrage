const BigNumber = require('bignumber.js');
const { CURRENCIES } = require('../../consts')
const request = require('../../lib/request')
const getDexPrice = require('../../lib/graph/dex/get-price');

const getPrice = async (symbol) => {
    const data = await request({
        url: `https://api.binance.com/api/v3/ticker/bookTicker?symbol=${symbol}`,
        method: 'GET',
      }).then((resp) => {
        return resp.data;
      });

    return data;
}

const getPriceBlockchain = async (symbol) => {
    const data = await request({
        url: `https://api.blockchain.com/v3/exchange/l2/${symbol}`,
        method: 'GET',
      }).then((resp) => {
        return resp.data;
      });
    console.log('data', data)

    return {
        bidPrice: data.bids[0].px,
        askPrice: data.asks[0].px,
    };
}

const getPriceBitfinex = async (symbol) => {
    const data = await request({
        url: `https://api-pub.bitfinex.com/v2/ticker/t${symbol}`,
        method: 'GET',
      }).then((resp) => {
        return resp.data;
      });
    console.log('data', data)

    return [{
        bidPrice: data[0],
        askPrice: data[2],
    }, 1-0.0007];
}

const getPriceKraken = async (symbol) => {
    const data = await request({
        url: `https://api.kraken.com/0/public/Ticker?pair=${symbol}`,
        method: 'GET',
      }).then((resp) => {
        return resp.data.result;
      });
    console.log('data', data)

    return [{
        bidPrice: data[0],
        askPrice: data[2],
    }, 1-0.0007];
}

const getPriceUniswap = async (symbol) => {
    const data = await getDexPrice(symbol);
    const price = BigNumber(data._reserve0).dividedBy(data._reserve1).toString();

    return [{
        bidPrice: price,
        askPrice: price,
    }, 1-0.0005];
}

module.exports = async (req, res) => {
    let balance = BigNumber(100);
    const { path } = req.body;
    for(let p of path) {
        const [data, fee] = await getPriceUniswap(p.symbol);
        let price = BigNumber(data.bidPrice);
        if(p.isReverse){
            price = BigNumber(1).dividedBy(data.askPrice);
        }
        balance = balance.multipliedBy(price).multipliedBy(fee);
        console.log('ppppppp', data, p.symbol, p.isReverse)
    }
  console.log('balancebalancebalance', balance.toString())
//   getPrice()
return {};
}

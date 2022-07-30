const { CURRENCIES } = require('../../consts')
const request = require('../../lib/request')

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

module.exports = async (req, res) => {
    let balance = 100;
    const { path } = req.body;
    for(let p of path) {
        const [data, fee] = await getPriceKraken(p.symbol);
        let price = data.bidPrice;
        if(p.isReverse){
            price = 1 / data.askPrice;
        }
        balance = balance * price * fee;
        console.log('ppppppp', data, p.symbol, p.isReverse)
    }
  console.log('balancebalancebalance', balance)
//   getPrice()
return {};
}

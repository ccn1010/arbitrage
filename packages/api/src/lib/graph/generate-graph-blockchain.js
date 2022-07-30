const request = require('../request')
const { API_URL, CURRENCIES } = require('../../consts')

module.exports = async (logger) => {
  logger.info('attempting to create graph')

  // const symbolResp = await request({
  //   logger,
  //   url: `https://api.blockchain.com/v3/exchange/symbols`,
  //   method: 'GET',
  // });
  // console.log('symbolResp', symbolResp)
  // const symbols = [];
  // const data = symbolResp.data;
  // Object.keys(data).forEach(key=>{
  //   const item = data[key];
  //   if(item.status !== 'open'){
  //     return;
  //   }

  //   symbols.push({
  //     from: item.base_currency,
  //     to: item.counter_currency,
  //     symbol: key,
  //   });
  // });

  // TODO 改成 symbols.sort
  const finalSymbols = [];
  // for(let i=0; i<symbols.length; i = i + 200) {
  //   const subSymbols = symbols.slice(i, i+200);
  //   const values = await request({
  //     logger,
  //     url: `https://api.binance.com/api/v3/ticker/price?symbols=[${subSymbols.map(item=>`"${item.symbol}"`).join(',')}]`,
  //     method: 'GET',
  //   }).then((resp) => {
  //     return resp.data;
  //   });

  //   subSymbols.sort((a, b)=>a.symbol.localeCompare(b.symbol));
  //   values.sort((a, b)=>a.symbol.localeCompare(b.symbol));
  //   subSymbols.forEach((item, index)=>{
  //     finalSymbols.push({
  //       from: item.from,
  //       to: item.to,
  //       weight: values[index].price,
  //       symbol: item.symbol,
  //     });
  //     finalSymbols.push({
  //       to: item.from,
  //       from: item.to,
  //       weight: 1/values[index].price,
  //       isReverse: true,
  //       symbol: item.symbol,
  //     });
  //   });
  // }
  
  const values = await request({
    logger,
    url: `https://api.blockchain.com/v3/exchange/tickers`,
    method: 'GET',
  }).then((resp) => {
    return resp.data;
  });

  values.forEach(item=>{
    const {
      symbol,
      last_trade_price,
    } = item;
    const [from, to] = symbol.split('-');
    finalSymbols.push({
      from: from,
      to: to,
      weight: last_trade_price,
      symbol: symbol,
    });
    finalSymbols.push({
      to: from,
      from: to,
      weight: 1/last_trade_price,
      isReverse: true,
      symbol: symbol,
    });
  })

  console.log('vvvvv', finalSymbols)

  const nodeMap = {};
  finalSymbols.forEach(symbol=>{
    let list = nodeMap[symbol.from];
    if(!list){
      list = [];
      nodeMap[symbol.from] = list;
    }

    const dest = list.find(item=>{
      return item.to === symbol.to;
    });
    if(dest && symbol.isReverse){
      console.log('ffff', dest)
      return;
    }
    list.push(symbol);
  });

  return nodeMap;
}

const request = require('../request')

const coins = [
  'USD', 'UST', 'BTC', 'ETH', 
]

module.exports = async (logger) => {
  logger.info('attempting to create graph')

  const symbolResp = await request({
    logger,
    url: `https://api-pub.bitfinex.com/v2/conf/pub:list:pair:exchange`,
    method: 'GET',
  });
  // console.log('symbolResp', symbolResp)
  const symbols = symbolResp.data[0];
  console.log('symbols', symbols)

  // TODO 改成 symbols.sort
  const finalSymbols = [];
  for(let i=0; i<symbols.length; i = i + 200) {
    const subSymbols = symbols.slice(i, i+200);
    const values = await request({
      logger,
      url: `https://api-pub.bitfinex.com/v2/tickers?symbols=${subSymbols.map(item=>'t'+item).join(',')}`,
      method: 'GET',
    }).then((resp) => {
      const data = resp.data;
      return data.map(item=>{
        const symbol = item[0].slice(1);
        const cs = symbol.split(':');
        let from, to;
        if(cs.length > 1){
          from = cs[0];
          to = cs[1];
        }else{
          for(let coin of coins){
            if(symbol.startsWith(coin)){
              from = coin;
              to = symbol.replace(coin, '');
              break;
            }else if(symbol.endsWith(coin)){
              from = symbol.replace(coin, '');
              to = coin;
              break;
            }
          }
          if(!from){
            from = symbol.slice(0, 3);
            to = symbol.slice(3);
          }
        }

        return {
          symbol: symbol,
          from: from,
          to: to,
          bid: item[1],
          ask: item[3],
        };
      })
    });

    console.log('valuesvaluesvalues', values)

    values.forEach((item)=>{
      finalSymbols.push({
        from: item.from,
        to: item.to,
        weight: item.bid,
        symbol: item.symbol,
      });
      finalSymbols.push({
        to: item.from,
        from: item.to,
        weight: 1/item.ask,
        isReverse: true,
        symbol: item.symbol,
      });
    });
  }

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

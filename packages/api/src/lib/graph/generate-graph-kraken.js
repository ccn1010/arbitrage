const request = require('../request')

module.exports = async (logger) => {
  logger.info('attempting to create graph')

  const symbolResp = await request({
    logger,
    url: `https://api.kraken.com/0/public/AssetPairs`,
    method: 'GET',
  });
  // console.log('symbolResp', symbolResp)
  // const symbols = {};
  const result = symbolResp.data.result;
  Object(result).forEach((key)=>{
    const item = result[key];

    symbols.push({
      from: item.base,
      to: item.quote,
      symbol: item.altname,
    });
  });
  // console.log('symbols', symbols)

  // TODO 改成 symbols.sort
  const finalSymbols = [];
  const keys = Object.keys(result);
  for(let i=0; i<keys.length; i = i + 200) {
    const subSymbols = symbols.slice(i, i+200);
    const values = await request({
      logger,
      url: `https://api.kraken.com/0/public/Ticker?pair=${subSymbols.map(item=>item.symbol).join(',')}`,
      method: 'GET',
    }).then((resp) => {
      return resp.data.result;
    });

    subSymbols.forEach((item, index)=>{
      finalSymbols.push({
        from: item.from,
        to: item.to,
        weight: values[index].price,
        symbol: item.symbol,
      });
      finalSymbols.push({
        to: item.from,
        from: item.to,
        weight: 1/values[index].price,
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

  // console.log('nodeMap', nodeMap, finalSymbols.length)

  // const list = CURRENCIES.map((currency) => request({
  //   logger,
  //   url: `${API_URL}?base=${currency}`,
  //   method: 'GET',
  // }).then((resp) => {
  //   return resp.data;
  // }));
  // const values = await Promise.all(list)
  // console.log('valuesvaluesvalues', values)

  const ret = {};
  // values.forEach(item=>{
  //   const cdata = refactorResponse(item)
  //   // console.log('cccc', cdata)
  //   ret[item.base] = cdata;
  // });
  
  // console.log('ret', values.length, ret)
  // return ret;
  return nodeMap;
}

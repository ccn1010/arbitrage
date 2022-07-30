const request = require('../request')
const { API_URL, CURRENCIES } = require('../../consts')

const refactorResponse = ({ rates, base }) => {
  const ret = Object
    .entries(rates)
    // XXX 应该加这个filter吗
    // .filter(([currency])=>CURRENCIES.includes(currency.toUpperCase()))
    .map(([currency, weight]) => ({
      to: currency,
      from: base,
      weight,
    }))

  // console.log('rrrr', ret)
  return ret;
}

// async function getDSymbols(logger) {
//   const symbolResp = await request({
//     logger,
//     url: `https://dapi.binance.com/dapi/v1/exchangeInfo`,
//     method: 'GET',
//   });
//   console.log('dsymbolResp', symbolResp)
//   const symbols = [];
//   symbolResp.data.symbols.filter(item=>{
//     console.log('iiii', item)
//     return item.contractStatus === 'TRADING';
//   }).forEach(item=>{
//     symbols.push({
//       // 这里故意反过来了
//       from: item.baseAsset,
//       to: item.quoteAsset,
//       // to: item.baseAsset,
//       // from: item.symbol.replace(item.baseAsset, ''),
//       symbol: item.pair,
//     });
//   });
//   console.log('dsymbols', symbols)

//   // TODO 改成 symbols.sort
//   const finalSymbols = [];
//   for(let i=0; i<symbols.length; i = i + 1) {
//     const values = await request({
//       logger,
//       url: `https://dapi.binance.com/dapi/v1/ticker/price?pair=${symbols[i]}`,
//       method: 'GET',
//     }).then((resp) => {
//       return resp.data;
//     });

//     subSymbols.sort((a, b)=>a.symbol.localeCompare(b.symbol));
//     values.sort((a, b)=>a.symbol.localeCompare(b.symbol));
//     subSymbols.forEach((item, index)=>{
//       finalSymbols.push({
//         ...item,
//         weight: values[index].price,
//       });
//     });
//   }

//   return finalSymbols;
// }

// async function getFSymbols(logger) {
//   const symbolResp = await request({
//     logger,
//     url: `https://api.binance.com/api/v3/exchangeInfo`,
//     method: 'GET',
//   });
//   console.log('symbolResp', symbolResp)
//   const symbols = [];
//   symbolResp.data.symbols.filter(item=>{
//     return item.status === 'TRADING';
//   }).forEach(item=>{
//     symbols.push({
//       // 这里故意反过来了
//       from: item.baseAsset,
//       to: item.symbol.replace(item.baseAsset, ''),
//       // to: item.baseAsset,
//       // from: item.symbol.replace(item.baseAsset, ''),
//       symbol: item.symbol,
//     });
//   });
//   console.log('symbols', symbols)

//   // TODO 改成 symbols.sort
//   const finalSymbols = [];
//   for(let i=0; i<symbols.length; i = i + 200) {
//     const subSymbols = symbols.slice(i, i+200);
//     const values = await request({
//       logger,
//       url: `https://api.binance.com/api/v3/ticker/price?symbols=[${subSymbols.map(item=>`"${item.symbol}"`).join(',')}]`,
//       method: 'GET',
//     }).then((resp) => {
//       return resp.data;
//     });

//     subSymbols.sort((a, b)=>a.symbol.localeCompare(b.symbol));
//     values.sort((a, b)=>a.symbol.localeCompare(b.symbol));
//     subSymbols.forEach((item, index)=>{
//       finalSymbols.push({
//         ...item,
//         weight: values[index].price,
//       });
//     });
//   }
// }

module.exports = async (logger) => {
  logger.info('attempting to create graph')

  const symbolResp = await request({
    logger,
    url: `https://api.binance.com/api/v3/exchangeInfo`,
    method: 'GET',
  });
  // console.log('symbolResp', symbolResp)
  const symbols = [];
  symbolResp.data.symbols.filter(item=>{
    return item.status === 'TRADING';
  }).forEach(item=>{
    // if(symbols.length >= 600){
    //   return;
    // }
    symbols.push({
      // 这里故意反过来了
      from: item.baseAsset,
      to: item.symbol.replace(item.baseAsset, ''),
      // to: item.baseAsset,
      // from: item.symbol.replace(item.baseAsset, ''),
      symbol: item.symbol,
    });
  });
  // console.log('symbols', symbols)

  // TODO 改成 symbols.sort
  const finalSymbols = [];
  for(let i=0; i<symbols.length; i = i + 200) {
    const subSymbols = symbols.slice(i, i+200);
    const values = await request({
      logger,
      url: `https://api.binance.com/api/v3/ticker/price?symbols=[${subSymbols.map(item=>`"${item.symbol}"`).join(',')}]`,
      method: 'GET',
    }).then((resp) => {
      return resp.data;
    });

    subSymbols.sort((a, b)=>a.symbol.localeCompare(b.symbol));
    values.sort((a, b)=>a.symbol.localeCompare(b.symbol));
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

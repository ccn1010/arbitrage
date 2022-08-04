const BigNumber = require('bignumber.js');
const getPairs = require('./scan-pairs')

module.exports = async (logger) => {
  logger.info('attempting to create graph')
  const finalSymbols = [];
  const pairs = await getPairs();
  // const one = BigNumber(1);
  const zero = BigNumber(0);

  pairs.forEach(item=>{
    // console.log('itemitemitem', item)
    if(item.weight.isEqualTo(zero)){
      return;
    }
    finalSymbols.push({
      from: item.from,
      to: item.to,
      weight: item.weight,
      symbol: item.symbol,
    });
    finalSymbols.push({
      to: item.from,
      from: item.to,
      weight: BigNumber(1).dividedBy(item.weight),
      isReverse: true,
      symbol: item.symbol,
    });

    console.log('wwwwww', item.weight.toString(), BigNumber(1).dividedBy(item.weight).toString())
  });

  // console.log('vvvvv', finalSymbols)

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
    // 这里会触发吗？
    if(dest && symbol.isReverse){
      console.log('ffff', dest)
      return;
    }
    list.push(symbol);
  });

  return nodeMap;
}

const request = require('../request')
const { API_URL, CURRENCIES } = require('../../consts')

const refactorResponse = ({ rates, base }) => {
  const ret = Object
    .entries(rates)
    // XXX 应该加这个filter吗
    .filter(([currency])=>CURRENCIES.includes(currency.toUpperCase()))
    .map(([currency, weight]) => ({
      to: currency,
      from: base,
      weight,
    }))

  return ret;
}

module.exports = async (logger) => {
  logger.info('attempting to create graph')

  const list = CURRENCIES.map((currency) => request({
    logger,
    url: `${API_URL}?base=${currency}`,
    method: 'GET',
  }).then((resp) => {
    return resp.data;
  }));
  const values = await Promise.all(list)
  // console.log('valuesvaluesvalues', values)

  const ret = {};
  values.forEach(item=>{
    const cdata = refactorResponse(item)
    // console.log('cccc', cdata)
    ret[item.base] = cdata;
  });
  
  // console.log('ret', values.length, ret)
  return ret;
}

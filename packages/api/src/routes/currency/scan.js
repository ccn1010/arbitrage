const BigNumber = require('bignumber.js');
const scanFactory = require('../../lib/graph/dex/scan-factory');

module.exports = async (req, res) => {
  await scanFactory();
  return {};
}

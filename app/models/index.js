// Aggregates and exports all models
const accountTypeModel = require('./accountTypeModel').default;
const userModel = require('./userModel');
const voucherModel = require('./voucherModel');

module.exports = {
  accountTypeModel,
  userModel,
  voucherModel,
};
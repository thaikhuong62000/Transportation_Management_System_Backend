"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

const userType = {
  All: 0,
  User: 1,
  Iron: 2,
  Gold: 3,
  Diamond: 4,
  Platinum: 5,
};

module.exports = {
  async applyVoucher(voucherId, fee, user) {
    if (voucherId) {
      let _voucher = await strapi.services.voucher.findOne({ id: voucherId });
      if (!_voucher) {
        throw "Cannot find voucher";
      }

      let { sale_type, sale, sale_max, customer_type } = _voucher;

      if (userType[customer_type] > userType[user.type])
        throw "Invalid Voucher";

      switch (sale_type) {
        case "value":
          fee = fee - sale;
          break;
        case "percentage":
          let discount = fee - (fee * sale) / 100;
          if (discount > sale_max) {
            discount = sale_max;
          }
          fee = fee - discount;
          break;
        default:
          break;
      }
      if (fee < 0) fee = 0;
    }
    return fee;
  },
};

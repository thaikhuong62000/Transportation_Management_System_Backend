"use strict";

module.exports = {
  async getFeeFromOrder(ctx) {
    try {
      const {
        from_address,
        to_address,
        voucher = "",
        packages = [],
      } = ctx.request.body;

      const { id } = ctx.state.user;

      if (
        !from_address ||
        !to_address ||
        !Object.keys(from_address).length ||
        !Object.keys(to_address).length ||
        !Object.values(from_address).length ||
        !Object.values(to_address).length
      ) {
        throw "Invalid address";
      }

      if (!packages || (Array.isArray(packages) && !packages.length)) {
        throw "Invalid packages";
      }

      let fee = await strapi.services.fee.calcFee(
        from_address,
        to_address,
        packages,
        id,
        voucher
      );

      return fee;
    } catch (error) {
      return ctx.badRequest([
        {
          id: "Fee.getFeeFromOrder",
          message: error,
        },
      ]);
    }
  },
};

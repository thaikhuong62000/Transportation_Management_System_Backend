"use-strict";

module.exports = {
  async getNearestStorageFromAddress(ctx) {
    let { address } = ctx.request.body;
    if (
      !address ||
      typeof address !== "object" ||
      !Object.keys(address).length ||
      !Object.values(address)
    ) {
      return ctx.badRequest([
        {
          id: "Address.getNearestStorageFromAddress",
          message: "Invalid address",
        },
      ]);
    }
    return await strapi.services.storage.getNearestStorage(address);
  },
};

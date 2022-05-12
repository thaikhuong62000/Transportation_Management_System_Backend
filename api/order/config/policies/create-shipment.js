"use-strict";

module.exports = async (ctx, next) => {
  await next();
  if (ctx.response.status === 200) {
    const order = ctx.response.body;
    strapi.services.storage
      .getNearestStorage(order.to_address)
      .then((storage) => {
        const { _id: _fid, id: fid, ...from_address } = order.from_address;
        const { _id: _tid, id: tid, ...to_address } = storage.address;
        strapi.services.shipment
          .create({
            from_address,
            to_address,
            packages: order.packages.map((item) => item.id),
            to_storage: storage.id,
          })
          .then((data) => {})
          .catch((err) => {});
      })
      .catch((err) => {});
  }
};

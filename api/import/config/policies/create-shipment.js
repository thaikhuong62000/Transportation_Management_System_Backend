"use-strict";

module.exports = async (ctx, next) => {
  await next();
  if (ctx.createShipment && ctx.response.status === 200) {
    const { order, store } = ctx.createShipment;
    const { _id: _tid, id: tid, ...from_address } = store.address;
    const { _id: _fid, id: fid, ...to_address } = order.to_address;
    strapi.services.shipment
      .create({
        from_address,
        to_address,
        packages: order.packages.map((item) => item.id),
        from_storage: store.id,
      })
      .then((data) => {})
      .catch((err) => {});
  }
};

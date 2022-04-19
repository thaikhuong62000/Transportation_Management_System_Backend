"use-strict";

module.exports = async (ctx, next) => {
  const { quantity, shipment, package: _package, assmin } = ctx.request.body;
  try {
    if (parseInt(quantity) < 1) throw "Invalid quantity";
    if (!shipment) throw "Invalid shipment";
    if (!_package) throw "Invalid package";
  } catch (error) {
    return ctx.badRequest([
      {
        id: "shipment-item.create",
        message: error,
      },
    ]);
  }
  ctx.request.body = { quantity, shipment, package: _package, assmin };
  await next();
};

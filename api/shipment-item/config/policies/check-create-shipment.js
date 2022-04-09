"use-strict";

module.exports = async (ctx, next) => {
  const { quantity, shipment, package } = ctx.request.body;
  try {
    if (parseInt(quantity) < 1) throw "Invalid quantity";
    if (!shipment) throw "Invalid shipment";
    if (!package) throw "Invalid package";
  } catch (error) {
    return ctx.badRequest([
      {
        id: "shipment-item.create",
        message: error,
      },
    ]);
  }
  ctx.request.body = { quantity, shipment, package };
  await next();
};
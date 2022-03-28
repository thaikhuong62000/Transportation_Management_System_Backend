"use strict";

module.exports = async (ctx, next) => {
  if (ctx.state.user.role.name === "Customer") {
    ctx.query = {
      ...ctx.query,
      customer_type_in: ["All", ctx.state.user.type],
      expired_gte: new Date(),
      // customer: id,
    };
  }
  await next();
};

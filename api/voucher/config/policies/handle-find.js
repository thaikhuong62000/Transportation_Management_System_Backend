"use strict";

module.exports = async (ctx, next) => {
  let { _start = 0, _limit = 5 } = ctx.query;
  if (ctx.state.user.role.name === "Customer") {
    ctx.query = {
      ...ctx.query,
      customer_type_in: ["All", ctx.state.user.type],
      expired_gte: new Date(),
    };
  } else if (ctx.state.user.role.name === "Admin") {
    ctx.query = {
      ...ctx.query,
      _limit: _limit,
      _start: _start * _limit,
    };
  }
  await next();
};

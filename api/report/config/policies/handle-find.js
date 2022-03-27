"use strict";

module.exports = async (ctx, next) => {
  let { _start = 0, _limit = 5 } = ctx.query;

  if (ctx.state.user.role.name === "Stocker") {
    ctx.query = {
      ...ctx.query,
      "storage.id": ctx.state.user.storage,
      _limit: _limit,
      _start: _start * _limit,
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
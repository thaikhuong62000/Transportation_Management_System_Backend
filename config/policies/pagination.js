"use strict";

module.exports = async (ctx, next) => {
  let { _start = 0, _limit = 5 } = ctx.query;
  ctx.query = {
    ...ctx.query,
    _limit: _limit,
    _start: _start * _limit,
  };
  await next();
};

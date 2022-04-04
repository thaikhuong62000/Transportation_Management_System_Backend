"use strict";

module.exports = async (ctx, next) => {
  if (ctx.state.user.role.name === "Stocker") {
    ctx.query = {
      ...ctx.query,
      storage: ctx.state.user.storage,
    };
  }
  await next();
};

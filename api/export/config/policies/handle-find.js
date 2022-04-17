"use strict";

module.exports = async (ctx, next) => {
  if (ctx.state.user.role.name === "Stocker") {
    if (!ctx.state.user?.storage) return [];
    ctx.query = {
      ...ctx.query,
      storage: ctx.state.user.storage,
    };
  }
  await next();
};

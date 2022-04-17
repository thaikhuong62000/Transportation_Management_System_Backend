"use-strict";

module.exports = async (ctx, next) => {
  const { role, id, storage } = ctx.state.user;
  if (role.name === "Driver") {
    ctx.query = {
      ...ctx.query,
      manager: id,
    };
  } else if (role.name === "Stocker") {
    ctx.query = {
      ...ctx.query,
      "manager.storage": storage,
    };
  }
  await next();
};

"use-strict";

module.exports = async (ctx, next) => {
  const { role, id } = ctx.state.user;
  if (role.name === "Driver") {
    ctx.query = {
      ...ctx.query,
      manager: id,
    };
  }
  await next();
};

"use-strict";

module.exports = async (ctx, next) => {
  const { role, id } = ctx.state.user;
  if (role.name === "Customer") {
    ctx.query = {
      ...ctx.query,
      customer: id,
    };
  }
  await next();
};

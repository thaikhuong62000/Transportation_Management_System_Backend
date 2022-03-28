"use-strict";

module.exports = async (ctx, next) => {
  const { role, id } = ctx.state.user;
  if (role.name === "Stocker") {
    ctx.query = {
      ...ctx.query,
      stocker: id,
    };
  }
  await next();
};

"use-strict";

module.exports = async (ctx, next) => {
  const { role, id } = ctx.state.user;
  const {
    fee = 0,
    remain_fee = 0,
    state = 0,
    packages = [],
    payments = [],
    customer = "",
    ...props
  } = ctx.request.body;
  if (role.name === "Customer") {
    if (state === 5) {
      ctx.request.body = {
        ...props,
        state,
      };
    } else {
      ctx.request.body = props
    }
  }
  await next();
};

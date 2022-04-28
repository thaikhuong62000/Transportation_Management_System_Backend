"use-strict";

module.exports = async (ctx, next) => {
  const { role } = ctx.state.user;
  const {
    confirmed,
    blocked,
    username,
    point,
    type,
    device_token,
    role: _role,
    car,
    orders,
    shipments,
    storage,
    reports,
    ...props
  } = ctx.request.body;
  if (role.name !== "Admin") {
    ctx.request.body = props;
  }
  await next();
};

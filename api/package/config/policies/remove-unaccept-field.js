"use-strict";

module.exports = async (ctx, next) => {
  const { role, id } = ctx.state.user;
  const {
    state = 0,
    order = "",
    current_address = {},
    position = "",
    images = null,
    imports = [],
    exports = [],
    shipments = [],
    ...props
  } = ctx.request.body;
  if (role.name === "Customer") {
    ctx.request.body = props;
  }
  await next();
};

"use-strict";

module.exports = async (ctx, next) => {
  let { role, id } = ctx.state.user;
  let updateId = ctx.params.id;

  console.log(id, updateId);

  if (["Customer", "Driver", "Stocker", "Assistance"].includes(role.name)) {
    if (updateId !== id) {
      return ctx.badRequest([
        {
          message: "Invalid user",
        },
      ]);
    }
  }
  await next();
};

"use-strict";

/**
 * Filter accepted user types
 *
 * @returns
 */
module.exports = async (ctx, next) => {
  let { role, id } = ctx.state.user;
  let updateId = ctx.params.id;

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

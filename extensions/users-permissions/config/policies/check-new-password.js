"use-strict";

/**
 * Check new password
 *
 * @returns
 */
module.exports = async (ctx, next) => {
  const { newPassword = "" } = ctx.request.body;

  let regex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/);
  if (!regex.test(newPassword)) {
    return ctx.badRequest([
      {
        message: "New password invalid!",
      },
    ]);
  }

  await next();
};

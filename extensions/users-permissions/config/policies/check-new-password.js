"use-strict";

/**
 * Check new password
 *
 * @returns
 */
module.exports = async (ctx, next) => {
  const { newPassword } = ctx.request.body;

  if (!newPassword || newPassword.length < 7) {
    return ctx.badRequest([
      {
        message: "New password invalid!",
      },
    ]);
  }

  await next();
};

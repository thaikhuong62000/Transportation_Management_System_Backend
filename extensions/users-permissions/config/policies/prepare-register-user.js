"use strict";

const phoneRegex = /^0[0-9]{9,10}$/g;

/**
 * Filter out unaccepted fields from body
 * Check and prepare data to create account
 */
module.exports = async (ctx, next) => {
  const { email, name, city, province, street, ward, password, phone } =
    ctx.request.body;
  const username = email;
  const address = { city, province, street, ward };
  if (phoneRegex.test(phone))
    return ctx.badRequest(
      null,
      formatError({
        id: "Auth.form.error.phone.format",
        message: "Please provide valid phone.",
      })
    );
  ctx.request.body = { email, username, name, password, phone, address };
  await next();
};

"use strict";
const { sanitizeEntity } = require("strapi-utils");

module.exports = async (ctx, next) => {
  await next();
  const { provider } = ctx.params;
  const message = ctx.response.body.message[0].messages[0].id;
  if (ctx.response.status === 400)
    if (message === "Auth.form.error.email.taken")
      if (provider === "facebook" || provider === "google")
        console.log(message);
};

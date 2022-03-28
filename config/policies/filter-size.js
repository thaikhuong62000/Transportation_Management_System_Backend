"use strict";

module.exports = async (ctx, next) => {
  const { size, ...query } = ctx.query;
  ctx.query = query;
  await next();
  size && filterSize(ctx, size);
};

function filterSize(ctx, size) {
  if (!size) return;
  size = JSON.parse(size);
  let response = ctx.response.body;
  Object.keys(size).forEach((attr) => {
    response = response.filter((item) => item?.size?.[attr] == size[attr]);
  });
  ctx.response.body = response;
}

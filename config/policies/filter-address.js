"use strict";

module.exports = async (ctx, next) => {
  const { address, from_address, to_address, ...query } = ctx.query;
  ctx.query = query;
  await next();
  address && filterAddress(ctx, address, getName({ address }));
  from_address && filterAddress(ctx, from_address, getName({ from_address }));
  to_address && filterAddress(ctx, to_address, getName({ to_address }));
};

function filterAddress(ctx, address, fieldName) {
  if (!address) return;
  address = JSON.parse(address);
  let response = ctx.response.body;
  Object.keys(address).forEach((subAddress) => {
    response = response.filter(
      (item) => item?.[fieldName]?.[subAddress] == address[subAddress]
    );
  });
  ctx.response.body = response;
}

function getName(object) {
  return Object.keys(object)[0];
}

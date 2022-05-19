"use-strict";

module.exports = async (ctx, next) => {
  const { packages } = ctx.request.body;
  try {
    if (!packages || !Array.isArray(packages) || !packages.length)
      throw "Invalid Package";
    const newPackages = packages.map((_package) => {
      const { quantity, weight, name, size, package_type } = _package;
      if (
        !quantity ||
        quantity <= 0 ||
        !weight ||
        weight <= 0 ||
        !size ||
        !package_type
      )
        throw "Invalid Package Info";
      if (size.len <= 0 || size.width <= 0 || size.height <= 0)
        throw "Invalid Package Size";
      return { quantity, weight, name, size, package_type };
    });
    ctx.request.body.packages = newPackages;
  } catch (error) {
    return ctx.badRequest([
      {
        message: error,
      },
    ]);
  }
  await next();
};

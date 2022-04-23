"use-strict";

module.exports = {
  async updateConfig(ctx) {
    let { oil, point, furlough } = ctx.request.body;

    let { base, current, ...oil_props } = oil;
    let { days_before, days_limit, ...furlough_props } = furlough;
    let { silver, gold, diamond, platinum, ...point_props } = point;

    if (
      !base ||
      !current ||
      !days_before ||
      !days_limit ||
      !silver ||
      !gold ||
      !diamond ||
      !platinum
    ) {
      return ctx.badRequest([
        {
          id: "Setting.updateConfig",
          message: "Invalid config",
        },
      ]);
    }

    await strapi.tms.saveConfig({
      ...strapi.tms.config,
      oil: {
        base,
        current,
      },
      point: {
        silver,
        gold,
        diamond,
        platinum,
      },
      furlough: {
        days_before,
        days_limit,
      },
    });

    let {
      oil: _oil,
      furlough: _furlough,
      point: _point,
    } = strapi.tms.reloadConfig();

    return {
      _oil,
      _furlough,
      _point,
    };
  },

  async getConfig(ctx) {
    let { oil, furlough, point } = strapi.tms.config;
    return {
      oil,
      furlough,
      point,
    };
  },

  async getPointLevel(ctx) {
    let { id } = ctx.state.user;
    let { point: user_point } = await strapi
      .query("user", "users-permissions")
      .findOne({ id: id });
    return {
      user_point,
      point: strapi.tms.config.point,
    };
  },
};

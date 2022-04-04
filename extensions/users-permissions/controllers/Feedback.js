"use-strict";
const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  async getFeedback(ctx) {
    const { _start = 0, _limit = 5 } = ctx.query;

    let feedbacks = await strapi.services.order.search({
      ...ctx.query,
      _start: _start * _limit,
      _limit: _limit,
    });

    let totalOrder = await strapi.services.order.count()
    let totalPage = Math.ceil(totalOrder / _limit)

    feedbacks = feedbacks.map((fb) => {
      return sanitizeEntity(fb, {
        model: strapi.query("order").model,
        includeFields: ["rating_note", "customer.name", "rating_point"],
      });
    });

    return {
      feedbacks: feedbacks,
      totalPage: totalPage
    }
  },
};

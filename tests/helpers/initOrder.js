const request = require("supertest");
const { createdOrder } = require("../__mocks__/OrderMocks");
const { jwtToken } = require("../__mocks__/AuthMocks");

module.exports = (key, orderData) => {
  // Create test order
  beforeAll(() => {
    return request(strapi.server)
      .post("/orders")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("customer"))
      .send(orderData)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((data) => {
        expect(data.body).toBeDefined();
        createdOrder(key, data.body);
      });
  });

  // Delete order
  afterAll(async () => {
    await strapi.services.shipment
      .delete({
        packages_in: createdOrder(key).packages.map((item) => item.id),
      })
      .then((data) => {
        expect(data).toBeDefined();
      });
    await strapi.services.package
      .delete({
        order: createdOrder(key).id,
      })
      .then((data) => {
        expect(data).toBeDefined();
      });
    await strapi.services.order
      .delete({
        id: createdOrder(key).id,
      })
      .then((data) => {
        expect(data).toBeDefined();
      });
  });
};

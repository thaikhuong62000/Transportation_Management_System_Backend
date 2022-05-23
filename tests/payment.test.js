require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");
const initOrder = require("./helpers/initOrder");
const mockOrder = require("./order/mockOrder");
const { mockUserData } = require("./testsuite1/mockData");
const { createdOrder } = require("./__mocks__/OrderMocks");

initUser("customer", mockUserData.customer);
initUser("driver", mockUserData.driver);
initOrder("order", mockOrder[0]);

require("./payment");

// Delete payment
afterAll(async () => {
  await strapi.services.payment
    .delete({
      order: createdOrder("order").id,
    })
    .then((data) => {
      expect(data).toBeDefined();
    });
});

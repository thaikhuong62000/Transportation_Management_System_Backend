require("./helpers/initTestSuite");

const initUser = require("./helpers/initUser");

const mockUserData = {
  username: "atesterot",
  email: "atesterot@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654321",
  confirmed: true,
  blocked: null,
  role: "customer",
  type: "Platinum",
};

initUser("customer",mockUserData);

require("./order-template");

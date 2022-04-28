require("./helpers/initTestSuite");

const initUser = require("./helpers/initUser");

const mockUserData = {
  username: "atester",
  email: "atester@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654321",
  confirmed: true,
  blocked: null,
  role: "customer",
  type: "Platinum",
};

initUser("customer", mockUserData);
require("./package-template");

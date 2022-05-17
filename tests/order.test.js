require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");
const loginUser = require("./helpers/loginUser");
const initOrder = require("./helpers/initOrder");
const mockOrder = require("./order/mockOrder");

const mockUserData = {
  username: "acustomerod",
  email: "acustomerod@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654322",
  confirmed: true,
  blocked: null,
  type: "Platinum",
  role: "customer",
};

const mockAdminData = {
  email: "admin",
  password: "12345678",
};

initUser("customer", mockUserData);
loginUser("admin", mockAdminData);
initOrder("order", mockOrder[0]);

require("./order");

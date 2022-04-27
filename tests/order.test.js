require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");
const loginUser = require("./helpers/loginUser");

const mockUserData = {
  username: "acustomer",
  email: "acustomer@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654322",
  confirmed: true,
  blocked: null,
  type: "Platinum",
  role: "customer",
};

initUser("customer", mockUserData);

const mockAdminData = {
  email: "admin",
  password: "12345678",
};

loginUser("admin", mockAdminData);

require("./order");

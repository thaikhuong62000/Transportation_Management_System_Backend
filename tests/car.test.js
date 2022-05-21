require("./helpers/initTestSuite");

require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");

const mockUserData = {
  username: "atesterc",
  email: "atesterc@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654321",
  confirmed: true,
  blocked: null,
  type: "Driver",
  role: "driver",
};

const stockerData = {
  username: "atester2c",
  email: "atester2c@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654821",
  confirmed: true,
  blocked: null,
  type: "Stocker",
  role: "stocker",
};

const mockAdminData = {
  email: "admin",
  password: "12345678",
};

initUser("driver", mockUserData);
initUser("stocker", stockerData);
require("./helpers/loginUser")("admin", mockAdminData);

require("./car");

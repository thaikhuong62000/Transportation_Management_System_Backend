require("./helpers/initTestSuite");

const initUser = require("./helpers/initUser");

const mockStockerData = {
  username: "atesterflfl",
  email: "atesterflfl@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654321",
  confirmed: true,
  blocked: null,
  storage: "6252b6055eedf42d04bd514e",
  type: "Stocker",
  role: "stocker",
};

const mockDriverData = {
  username: "atester3fl",
  email: "ateste3rfl@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987333321",
  confirmed: true,
  blocked: null,
  type: "Driver",
  role: "driver",
};

const mockCustomerData = {
  username: "atester4fl",
  email: "atester4fl@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987444421",
  confirmed: true,
  blocked: null,
  type: "Platinum",
  role: "customer",
};
const mockAdminData = {
  email: "admin",
  password: "12345678",
};

initUser("stocker", mockStockerData);
initUser("driver", mockDriverData);
initUser("customer", mockCustomerData);
require("./helpers/loginUser")("admin", mockAdminData);

require("./furlough");

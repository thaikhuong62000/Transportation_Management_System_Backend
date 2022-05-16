require("./helpers/initTestSuite");

const initUser = require("./helpers/initUser");

const mockStockerData = {
  username: "atestereport",
  email: "atestereport@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654321",
  confirmed: true,
  blocked: null,
  storage: "6252b6055eedf42d04bd514e",
  type: "Stocker",
  role: "stocker",
};

const mockStocker2Data = {
  username: "atestereport2",
  email: "atestereport2@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654322",
  confirmed: true,
  blocked: null,
  type: "Stocker",
  role: "stocker",
};

const mockDriverData = {
  username: "atester3eport",
  email: "ateste3reortp@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987333321",
  confirmed: true,
  blocked: null,
  type: "Driver",
  role: "driver",
};

const mockCustomerData = {
  username: "atester4eport",
  email: "atester4eport@strapi.com",
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

const packageData = {
  package_type: "normal",
  name: "atest package",
  quantity: 1,
  weight: 50,
  note: "tét ",
  size: {
    len: 35,
    width: 20,
    height: 165,
  },
};

const shipmentItemData = { quantity: 10, assmin: false };

initUser("stocker", mockStockerData);
initUser("stocker2", mockStocker2Data);
initUser("driver", mockDriverData);
initUser("customer", mockCustomerData);
require("./helpers/loginUser")("admin", mockAdminData);
require("./helpers/initPackage")("package", packageData);

require("./export");

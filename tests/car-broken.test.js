require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");
const login = require("./helpers/loginUser");
const initCar = require("./helpers/initCar");

const mockUserData = {
  username: "atestercb",
  email: "atestercb@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654321",
  confirmed: true,
  blocked: null,
  type: "Driver",
  role: "driver",
};

const mockUserData2 = {
  username: "atester2cb",
  email: "atester2cb@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0989786321",
  confirmed: true,
  blocked: null,
  type: "Driver",
  role: "driver",
};

const mockAdminData = {
  email: "admin",
  password: "12345678",
};

const car = {
  licence: "3123",
  type: "Asdas",
  load: 1,
};

initUser("driver", mockUserData);
initUser("driver2", mockUserData2);
login("admin", mockAdminData);
initCar(car, "driver");

require("./car-broken");

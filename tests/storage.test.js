require("./helpers/initTestSuite");

const initUser = require("./helpers/initUser");
const { jwtToken } = require("./__mocks__/AuthMocks");
const { variable } = require("./__mocks__/Global");

const request = require("supertest");

const mockStockerData = {
  username: "atesterstorage",
  email: "atesterfl@strapi.com",
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
  username: "atester3storage",
  email: "ateste3rep@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987333321",
  confirmed: true,
  blocked: null,
  type: "Driver",
  role: "driver",
};

const mockCustomerData = {
  username: "atester4storage",
  email: "atester4ep@strapi.com",
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

beforeAll(async () => {
  await request(strapi.server)
    .post("/auth/local")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .send({
      identifier: mockAdminData.email,
      password: mockAdminData.password,
    })
    .expect("Content-Type", expect === 404 ? /text/ : /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.jwt).toBeDefined();
      jwtToken("admin", data.body.jwt);
    });
});
require("./storage");

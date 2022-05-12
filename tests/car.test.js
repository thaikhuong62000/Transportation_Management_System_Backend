require("./helpers/initTestSuite");

require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");
const { jwtToken } = require("./__mocks__/AuthMocks");
const request = require("supertest");

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

beforeAll(() => {
  return request(strapi.server)
    .post("/auth/local")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .send({
      identifier: mockAdminData.email,
      password: mockAdminData.password,
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.jwt).toBeDefined();
      jwtToken("admin", data.body.jwt);
    });
});

require("./car");

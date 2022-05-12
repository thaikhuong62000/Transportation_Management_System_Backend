require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");
const {jwtToken } = require("./__mocks__/AuthMocks");
const request = require("supertest");

const mockUserData = {
  username: "atesterv",
  email: "atesterv@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654321",
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

require("./voucher");

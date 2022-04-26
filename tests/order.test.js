require("./helpers/initTestSuite");

const { createdUser, jwtToken } = require("./__mocks__/AuthMocks");
const { createdOrder } = require("./__mocks__/OrderMocks");
const request = require("supertest");

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

require("./helpers/initUser")("customer", mockUserData);

const mockAdminData = {
  email: "admin",
  password: "12345678",
};

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

require("./order");

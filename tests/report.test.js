require("./helpers/initTestSuite");

const initUser = require("./helpers/initUser");
const { createdUser, jwtToken } = require("./__mocks__/AuthMocks");
const { variable } = require("./__mocks__/Global");
const request = require("supertest");
const loginUser = require("./helpers/loginUser");
const mockStockerData = {
  username: "atesterreport",
  email: "atesterreport@strapi.com",
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
  username: "atester3report",
  email: "ateste3rreport@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987333321",
  confirmed: true,
  blocked: null,
  type: "Driver",
  role: "driver",
};

const mockCustomerData = {
  username: "atester4report",
  email: "atester4report@strapi.com",
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
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.jwt).toBeDefined();
      jwtToken("admin", data.body.jwt);
    });
  await request(strapi.server)
    .post("/storages")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .send({
      name: "areport",
      address: { street: "A", ward: "a", province: "a", city: "A" },
      size: "66666",
      store_managers: [createdUser("stocker").id],
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      variable("storage", data.body.id);
    });
  await request(strapi.server)
    .post("/reports")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      variable("report", data.body.id);
    });
});
afterAll(async () => {
  await request(strapi.server) // app server is an instance of Class: http.Server
    .delete("/storages/" + variable("storage"))
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .expect("Content-Type", /json/)
    .expect(200);
  await request(strapi.server) // app server is an instance of Class: http.Server
    .delete("/reports/" + variable("report"))
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .expect("Content-Type", /json/)
    .expect(200);
});
require("./report");

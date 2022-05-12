require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");
const { jwtToken } = require("./__mocks__/AuthMocks");
const { variable } = require("./__mocks__/Global");

const request = require("supertest");

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

initUser("driver", mockUserData);
initUser("driver2", mockUserData2);

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

  await request(strapi.server) // app server is an instance of Class: http.Server
    .post("/cars")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .send({ licence: "3123", type: "Asdas", load: 1 })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      if (data?.body?.id) {
        variable("idCar", data.body.id);
      }
    });
});

afterAll(async () => {
  await request(strapi.server) // app server is an instance of Class: http.Server
    .delete("/cars/" + variable("idCar"))
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .expect("Content-Type", /json/)
    .expect(200);
});

require("./car-broken");

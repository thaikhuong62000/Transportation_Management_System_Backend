require("./helpers/initTestSuite");

const initUser = require("./helpers/initUser");
const { jwtToken } = require("./__mocks__/AuthMocks");
const { variable } = require("./__mocks__/Global");

const request = require("supertest");

const mockStockerData = {
  username: "atestershipment",
  email: "atesterfshipmentl@strapi.com",
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
  username: "atester3shipment",
  email: "ateste3rfshipmentsl@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987333321",
  confirmed: true,
  blocked: null,
  type: "Driver",
  role: "driver",
};

const mockCustomerData = {
  username: "atester4shipment",
  email: "atester4fshipmentl@strapi.com",
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
const storageData = {
  name: "a",
  address: { street: "A", ward: "a", province: "a", city: "A" },
  size: "66666",
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
  await request(strapi.server)
    .post("/packages")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .send(packageData)
    .expect("Content-Type", expect === 404 ? /text/ : /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.id).toBeDefined();
      variable("package", data.body.id);
    });
  await request(strapi.server)
    .post("/storages")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .send(storageData)
    .expect("Content-Type", expect === 404 ? /text/ : /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.id).toBeDefined();
      variable("storage", data.body.id);
    });

  await request(strapi.server) // app server is an instance of Class: http.Server
    .post("/cars")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .send({
      licence: "3123",
      type: "Asdas",
      load: 1,
      manager: variable("driver"),
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      if (data?.body?.id) {
        variable("idCar", data.body.id);
      }
    });

  await request(strapi.server)
    .get("/users/me")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("driver"))
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      variable("driver", data.body.id);
    });

  await request(strapi.server) // app server is an instance of Class: http.Server
    .put("/users/" + variable("driver"))
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .send({
      car: variable("idCar"),
    })
    .expect("Content-Type", /json/)
    .expect(200);
});
afterAll(async () => {
  await request(strapi.server) // app server is an instance of Class: http.Server
    .delete("/packages/" + variable("package"))
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .expect("Content-Type", /json/)
    .expect(200);

  await request(strapi.server) // app server is an instance of Class: http.Server
    .delete("/storages/" + variable("storage"))
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .expect("Content-Type", /json/)
    .expect(200);

  await request(strapi.server) // app server is an instance of Class: http.Server
    .delete("/cars/" + variable("idCar"))
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .expect("Content-Type", /json/)
    .expect(200);
});
require("./shipment");
require("./users-permissions/CustomUser/getDriverStatus"); // borrow data

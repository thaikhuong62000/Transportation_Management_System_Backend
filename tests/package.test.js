require("./helpers/initTestSuite");
const initUser = require("./helpers/initUser");
const loginUser = require("./helpers/loginUser");
const { jwtToken } = require("./__mocks__/AuthMocks");
const { variable } = require("./__mocks__/Global");
const request = require("supertest");
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

const mockDriverData = {
  username: "atester3packages",
  email: "ateste3packages@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987333321",
  confirmed: true,
  blocked: null,
  type: "Driver",
  role: "driver",
};

const mockStockerData = {
  username: "atesterpackages",
  email: "atesterpackages@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654321",
  confirmed: true,
  blocked: null,
  storage: "6252b6055eedf42d04bd514e",
  type: "Stocker",
  role: "stocker",
};

const mockAdminData = {
  email: "admin",
  password: "12345678",
};

loginUser("admin", mockAdminData);
initUser("driver", mockDriverData);
initUser("stocker", mockStockerData);

beforeAll(async () => {
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
});

afterAll(async () => {
  await request(strapi.server) // app server is an instance of Class: http.Server
    .delete("/packages/" + variable("package"))
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .expect("Content-Type", /json/)
    .expect(200);
});

require("./package");

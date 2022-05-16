const request = require("supertest");
const { createdUser, jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");
const login = require("./loginUser");

const mockAdminData = {
  email: "admin",
  password: "12345678",
};

module.exports = (car, driver) => {
  // Check admin
  if (!jwtToken("admin")) login("admin", mockAdminData);

  // Add car
  beforeAll(async () => {
    if (typeof driver === "string") driver = createdUser(driver);
    await request(strapi.server)
      .post("/cars")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .send({
        ...car,
        manager: driver.id,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((data) => {
        if (data?.body?.id) {
          variable("idCar", data.body.id);
        }
      });
  });

  // Delete test car
  afterAll(() => {
    return request(strapi.server)
      .delete("/cars/" + variable("idCar"))
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
  });
};

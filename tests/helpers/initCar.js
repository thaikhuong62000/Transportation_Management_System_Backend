const request = require("supertest");
const { createdUser, jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");

module.exports = (car, driver) => {
  beforeAll(async () => {
    await request(strapi.server)
      .post("/cars")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .send({
        ...car,
        manager: createdUser(driver).id,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((data) => {
        if (data?.body?.id) {
          variable("idCar", data.body.id);
        }
      });
  });

  afterAll(() => {
    return strapi.services.car
      .delete({
        id: variable("idCar"),
      })
      .then((data) => {
        expect(data).toBeDefined();
      });
  });
};

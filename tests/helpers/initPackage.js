const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");

module.exports = (key, packageData) => {
  beforeAll(async () => {
    await request(strapi.server)
      .post("/packages")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .send(packageData)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((data) => {
        expect(data.body.id).toBeDefined();
        variable(key, data.body.id);
      });
  });

  afterAll(async () => {
    await request(strapi.server)
      .delete("/packages/" + variable(key))
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
  });
};

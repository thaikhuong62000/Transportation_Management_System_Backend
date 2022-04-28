const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");

module.exports = (key, userData) => {
  // Login
  beforeAll(() => {
    return request(strapi.server)
      .post("/auth/local")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        identifier: userData.email ? userData.email : userData.username,
        password: userData.password,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((data) => {
        expect(data.body.jwt).toBeDefined();
        jwtToken({ key, value: data.body.jwt });
      });
  });
};

const request = require("supertest");
const { createdUser, jwtToken } = require("../__mocks__/AuthMocks");

module.exports = (key, userData, url) => {
  // Login
  beforeAll(() => {
    return request(url ? url : strapi.server)
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
        createdUser(key, data.body.user);
      });
  });
};

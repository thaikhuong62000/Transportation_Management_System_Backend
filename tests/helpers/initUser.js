const request = require("supertest");
const { createdUser, jwtToken } = require("../__mocks__/AuthMocks");

module.exports = (userData) => {
  // Create test user
  beforeAll(async () => {
    const role = await strapi
      .query("role", "users-permissions")
      .findOne({ type: userData.role }, []);
    const data = await strapi.plugins["users-permissions"].services.user.add({
      ...userData,
      role: role.id,
    });
    expect(data).toBeDefined();
    createdUser.mockReturnValue(data);
  });

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
        jwtToken.mockReturnValue(data.body.jwt);
      });
  });

  // Delete test user
  afterAll(() => {
    return strapi.plugins["users-permissions"].services.user
      .remove({
        id: createdUser().id,
      })
      .then((data) => {
        expect(data).toBeDefined();
        createdUser.mockReset();
      });
  });
};

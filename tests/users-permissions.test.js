require("./helpers/initTestSuite");

const { createdUser, jwtToken } = require("./__mocks__/AuthMocks");
const request = require("supertest");

const mockUserData = {
  username: "atester",
  email: "atester@strapi.com",
  provider: "local",
  password: "12345678",
  confirmed: true,
  blocked: null,
};

// Create test user
beforeAll(async () => {
  const role = await strapi
    .query("role", "users-permissions")
    .findOne({ type: "customer" }, []);
  const data = await strapi.plugins["users-permissions"].services.user.add({
    ...mockUserData,
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
      identifier: mockUserData.email,
      password: mockUserData.password,
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

require("./users-permissions");

require("./helpers/initTestSuite");

const {
  createdUser,
  jwtToken,
  firebaseToken,
} = require("./__mocks__/AuthMocks");
const request = require("supertest");

const mockUserData = {
  username: "atester",
  email: "atester@strapi.com",
  provider: "local",
  password: "12345678",
  phone: "0987654321",
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

// Get FirebaseToken
beforeAll(async () => {
  const user = await strapi.firebase.auth.getUserByPhoneNumber(
    "+84" + mockUserData.phone.slice(1)
  );
  const customToken = await strapi.firebase.auth.createCustomToken(user.uid);

  await request("https://identitytoolkit.googleapis.com")
    .post(`/v1/accounts:signInWithCustomToken?key=` + process.env.FIREBASE_KEY)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .send({
      token: customToken,
      returnSecureToken: true,
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.idToken).toBeDefined();
      firebaseToken.mockReturnValue(data.body.idToken);
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

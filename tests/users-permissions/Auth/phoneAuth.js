const request = require("supertest");

const { firebaseToken } = require("../../__mocks__/AuthMocks");

const mockPasswordData = [
  { token: "", create: true, expected: "login" },
  { token: "1", create: true, expected: "not login" },
];

it.each(mockPasswordData)(
  "should $expected and return jwt",
  async ({ token, create, expected }) => {
    await request(strapi.server)
      .get("/auth/phone")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .query({ code: firebaseToken() + token, create })
      .expect("Content-Type", /json/)
      .expect(expected === "login" ? 200 : 400)
      .then((data) => {
        if (expected === "login") expect(data.body.jwt).toBeDefined();
      });
  }
);

const mockPhoneNumber = [{ phone: "+84695556341" }];

it.each(mockPhoneNumber)("Create a new user and login", async ({ phone }) => {
  let user;
  try {
    user = await strapi.firebase.auth.createUser({
      phoneNumber: phone,
      disabled: false,
    });
  } catch (error) {
    user = await strapi.firebase.auth.getUserByPhoneNumber(phone);
  }

  const customToken = await strapi.firebase.auth.createCustomToken(user.uid);

  const idToken = await request("https://identitytoolkit.googleapis.com")
    .post(
      `/v1/accounts:signInWithCustomToken?key=AIzaSyBjtDu2wvRzb9XUvbaJKQOinla7cIofqac`
    )
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
      return data.body.idToken;
    });

  await request(strapi.server)
    .get("/auth/phone")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .query({ code: idToken, create: true })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      expect(data.body.jwt).toBeDefined();
    });
});

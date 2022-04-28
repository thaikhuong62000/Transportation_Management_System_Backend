const request = require("supertest");
const getFirebaseToken = require("../../helpers/getFirebaseToken");

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
  const idToken = await getFirebaseToken(phone, false);

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

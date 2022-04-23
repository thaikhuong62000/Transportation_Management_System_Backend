const request = require("supertest");

const { firebaseToken } = require("../../__mocks__/AuthMocks");

const mockPasswordData = [
  { token: "", newPassword: "LonghighThienQuy1", expected: "update" },
  { token: "1", newPassword: "LonghighThienQuy1", expected: "not update" },
  { token: "", newPassword: "LonghighThienQuy1", expected: "update" },
  { token: "", newPassword: "", expected: "not update" },
];

it.each(mockPasswordData)(
  "should $expected password",
  async ({ token, newPassword, expected }) => {
    await request(strapi.server)
      .post("/auth/password/reset")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({ token: firebaseToken() + token, newPassword })
      .expect("Content-Type", /json/)
      .expect(expected === "update" ? 200 : 400);
  }
);

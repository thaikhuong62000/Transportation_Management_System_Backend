const request = require("supertest");

const { jwtToken } = require("../../__mocks__/AuthMocks");

const mockPasswordData = [
  {
    password: "12345678",
    newPassword: "LonghighThienQuy1",
    expected: "update",
  },
  {
    password: "LonghighThienQuy",
    newPassword: "12345678",
    expected: "not update",
  },
  {
    password: "LonghighThienQuy1",
    newPassword: "LonghighThienQuy2",
    expected: "update",
  },
  {
    password: "LonghighThienQuy2",
    newPassword: "LonghighThienQuy2",
    expected: "update",
  },
];

it.each(mockPasswordData)(
  "should $expected password",
  async ({ password, newPassword, expected }) => {
    await request(strapi.server)
      .post("/auth/password/update")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken())
      .send({ password, newPassword })
      .expect("Content-Type", /json/)
      .expect(expected === "update" ? 200 : 400);
  }
);

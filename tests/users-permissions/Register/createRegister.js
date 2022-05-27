const request = require("supertest");
const { jwtToken } = require("../../__mocks__/AuthMocks");
const testCaseData = [
  {
    message: "register user response 200 ",
    expect: 200,
    send: {
      email: "a@gmai.com",
      name: "",
      city: "",
      province: "",
      street: "",
      ward: "",
      password: "12345678",
      phone: "",
    },
  },
];

it.each(testCaseData)("$message", async ({ expect, send }) => {
  const registerId = await request(strapi.server)
    .post("/auth/local/register")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .send(send)
    .expect("Content-Type", /json/)
    .expect(expect)
    .then((data) => {
      console.log(data.body.user.id);
      return data.body.user.id;
    });
  await request(strapi.server) // app server is an instance of Class: http.Server
    .delete("/users/" + registerId)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("admin"))
    .expect("Content-Type", /json/)
    .expect(200);
});

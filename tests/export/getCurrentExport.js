const request = require("supertest");

// user mock data
const mockUserData = {
  username: "sibe",
  password: "12345678",
};

it("should login user and return jwt token", async () => {
  const auth = await request(strapi.server) // app server is an instance of Class: http.Server
    .post("/auth/local")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .send({
      identifier: mockUserData.username,
      password: mockUserData.password,
    })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      // console.log(data);
      expect(data.body.jwt).toBeDefined();
      return data
    });

  await request(strapi.server) // app server is an instance of Class: http.Server
    .get("/current-export")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + auth.body.jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      // test here, test date reponse
      // expect(data.body.jwt).toBeDefined();
    });
});

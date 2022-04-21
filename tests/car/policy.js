const request = require("supertest");

// user mock data
const mockUserData = {
  username: "tuiladriver",
  password: "12345678",
};

it("should login user and return jwt token", async () => {
  const response = await request(strapi.server) // app server is an instance of Class: http.Server
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
      expect(data.jwt);
    });
  await request(strapi.server) // app server is an instance of Class: http.Server
    .get("/cars")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + response.jwt)
    .expect("Content-Type", /json/)
    .expect(200)
    .then((data) => {
      expect(data.jwt).toBeDefined();
    });
});

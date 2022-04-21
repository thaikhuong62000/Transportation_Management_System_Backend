const server = "https://dev-cms.pntk.one";
const request = require("supertest");

const mockUserData = {
  username: "tuiladriver",
  password: "12345678",
};

it("should return 403", async () => {
  const jwt = await request(server)
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
      expect(data.body.jwt).toBeDefined();
      return data.body.jwt;
    });
  await request(server)
    .get("/car-brokens")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwt)
    .expect("Content-Type", /json/)
    .expect(403);
});

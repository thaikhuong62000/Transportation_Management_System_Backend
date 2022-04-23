const request = require("supertest");
const mockUserData = {
  username: "tuiladriver",
  password: "12345678",
};

it("đúng dữ liệu", async () => {
  const jwt = await request(strapi.server)
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
  await request(strapi.server)
    .post("/car-brokens")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwt)
    .send({
      time: new Date(),
      car: "624bb872e68d1a14e46f7706",
    })
    .expect("Content-Type", /json/)
    .expect(200);
});

it("sai định dạng thoi gian", async () => {
  const jwt = await request(strapi.server)
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
  await request(strapi.server)
    .post("/car-brokens")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwt)
    .send({
      time: "22/12/2000",
      car: "624bb872e68d1a14e46f7706",
    })
    .expect("Content-Type", /json/)
    .expect(400);
});

it("xe ko ton tai", async () => {
  const jwt = await request(strapi.server)
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
  await request(strapi.server)
    .post("/car-brokens")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwt)
    .send({
      time: "22/12/2000",
      car: "624bb872e68d2a14e46f7796",
    })
    .expect("Content-Type", /json/)
    .expect(400);
});

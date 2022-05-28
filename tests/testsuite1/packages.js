const request = require("supertest");
const { createdOrder } = require("../__mocks__/OrderMocks");
const { jwtToken, createdUser } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");

describe("getPackagesInStorage", () => {
  it("stocker1 get packages in storage", async () => {
    await request(strapi.server)
      .get("/packages/in-storage")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("stocker1"))
      .expect("Content-Type", /json/)
      .expect(200);
  });
  it("stocker1 get packages in storage", async () => {
    await request(strapi.server)
      .get("/packages/in-storage")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("stocker1"))
      .query({ _q: "o" })
      .expect("Content-Type", /json/)
      .expect(200);
  });
  it("stocker2 get packages in storage", async () => {
    await request(strapi.server)
      .get("/packages/in-storage")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("stocker2"))
      .expect("Content-Type", /json/)
      .expect(200);
  });
  it("admin get packages in storage", async () => {
    await request(strapi.server)
      .get("/packages/in-storage")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .query({ storeId: createdUser("stocker1").storage.id })
      .expect("Content-Type", /json/)
      .expect(200);
  });
  it("admin get packages in storage fail", async () => {
    await request(strapi.server)
      .get("/packages/in-storage")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(400);
  });
});

describe("getUnArrangePackage", () => {
  it("get UnArrangePackage by admin response 200", async () => {
    await request(strapi.server)
      .get("/packages/unarrange/" + createdUser("stocker1").storage.id)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
  });
});

describe("getUnCollectPackage", () => {
  it("get getUnCollectPackage by admin response 200", async () => {
    await request(strapi.server)
      .get("/packages/uncollect/" + createdUser("stocker1").storage.id)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
  });
});

describe("getUnShipPackage", () => {
  it("get getUnShipPackage by admin response 200", async () => {
    await request(strapi.server)
      .get("/packages/unship/" + createdUser("stocker1").storage.id)
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwtToken("admin"))
      .expect("Content-Type", /json/)
      .expect(200);
  });
});

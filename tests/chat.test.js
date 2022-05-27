require("./helpers/initTestSuite");
const request = require("supertest");

const initUser = require("./helpers/initUser");
const { jwtToken, createdUser } = require("./__mocks__/AuthMocks");
const { mockUserData } = require("./testsuite1/mockData");

initUser("customer", mockUserData.customer);
initUser("driver", mockUserData.driver);

let room;

// Init room-chat
beforeAll(async () => {
  room = await strapi.services["room-chat"].create({
    user1: createdUser("driver").id,
    user2: createdUser("customer").id,
  });
  await strapi.services.message.create({
    text: "1",
    user: createdUser("driver").id,
    room: room.id,
  });
});
afterAll(async () => {
  await strapi.services["room-chat"]
    .delete({
      user1: createdUser("driver").id,
    })
    .then((data) => {
      expect(data).toBeDefined();
    });
});

it("get rooms chat by driver", async () => {
  await request(strapi.server)
    .get("/room-chats/user/rooms")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("driver"))
    .expect("Content-Type", /json/)
    .expect(200);
});

it("get rooms chat by customer", async () => {
  await request(strapi.server)
    .get("/room-chats/user/rooms")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("customer"))
    .expect("Content-Type", /json/)
    .expect(200);
});

it("get messages chat by driver", async () => {
  await request(strapi.server)
    .get("/messages/room/" + room.id)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("driver"))
    .expect("Content-Type", /json/)
    .expect(200);
});

it("get messages chat by customer", async () => {
  await request(strapi.server)
    .get("/messages/room/" + room.id)
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("customer"))
    .expect("Content-Type", /json/)
    .expect(200);
});

it("get messages chat by customer fail", async () => {
  await request(strapi.server)
    .get("/messages/room/6288d15809b43e4592c93d76")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("customer"))
    .expect("Content-Type", /json/)
    .expect(400);
});

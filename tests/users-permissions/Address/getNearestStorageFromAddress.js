const request = require("supertest");
// const { mockAddress } = require("../../order/mockOrder");
const { jwtToken } = require("../../__mocks__/AuthMocks");

const mockPasswordData = [
  {
    messeger: "get nearest storage from address by admin response 200",
    expected: 200,
    type: "admin",
    send: {
      address: {
        street: "942/2 Kha Vạn Cân",
        ward: "Trường Thọ",
        province: "Thủ Đức",
        city: "Hồ Chí Minh",
        latitude: 10.8486187,
        longitude: 106.7534891,
      },
    },
  },
  {
    messeger: "get nearest storage from wrong address by admin response 400",
    expected: 400,
    type: "admin",
    send: {
      street: "942/2 Kha Vạn Cân",
      ward: "Trường Thọ",
      province: "Thủ Đức",
      city: "Hồ Chí Minh",
      latitude: 10.8486187,
      longitude: 106.7534891,
    },
  },
  {
    messeger:
      "get nearest storage from address without longitude by admin response 200",
    expected: 200,
    type: "admin",
    send: {
      address: {
        street: "942/2 Kha Vạn Cân",
        ward: "Trường Thọ",
        province: "Thủ Đức",
        city: "Hồ Chí Minh",
        latitude: 10.8486187,
      },
    },
  },
];

it.each(mockPasswordData)("$messeger", async ({ expected, type, send }) => {
  await request(strapi.server)
    .post("/address/nearest-storage")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .send(send)
    .expect("Content-Type", /json/)
    .expect(expected);
});

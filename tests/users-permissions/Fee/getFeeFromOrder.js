const request = require("supertest");
const { jwtToken } = require("../../__mocks__/AuthMocks");

const testCaseData = [
  {
    message: "customer get fee from order response 200 ",
    expect: 200,
    send: {
      from_address: {
        city: "Quảng Ninh",
        latitude: 15.920886145522292,
        longitude: 108.2056727260351,
        province: "Hạ Long",
        street: "2 Duong tu biet",
        ward: "Hà Khánh",
      },
      packages: [
        {
          length: 1,
          name: "apple",
          note: "",
          package_type: "normal",
          quantity: 23,
          size: { height: 123, len: 213, width: 123 },
          weight: 123,
        },
      ],
      to_address: {
        city: "Hồ Chí Minh",
        latitude: 10.806322512527341,
        longitude: 106.61174286156894,
        province: "1",
        street: "2 hem 24",
        ward: "Tân Định",
      },
      voucher: "6253da6eab6a35628906d9ba",
    },
    type: "customer",
  },
];

it.each(testCaseData)("$message", async ({ expect, type, send }) => {
  await request(strapi.server)
    .post("/fees")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .send(send)
    .expect("Content-Type", /json/)
    .expect(expect);
});

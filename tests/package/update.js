const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const { variable } = require("../__mocks__/Global");
const testCaseData = [
  {
    message: "update packages by admin response 200 ",
    expect: 200,
    type: "admin",
    send: {
      name: "a",
      len: "2",
      width: "2",
      height: "2",
      weight: "2",
      quantity: "1",
      state: 1,
      street: "942/2 Kha Vạn Cân",
      ward: "Trường Thọ",
      province: "Thủ Đức",
      city: "Hồ Chí Minh",
      position: "",
      package_type: "normal",
    },
  },
  {
    message: "update packages 2 by admin response 200 ",
    expect: 200,
    type: "admin",
    send: {
      name: "a",
      weight: "2",
      quantity: "1",
      len: "2",
      width: "2",
      height: "2",
      state: 1,
      position: "",
      current_address: {
        street: "942/2 Kha Vạn Cân",
        ward: "Trường Thọ",
        province: "Thủ Đức",
        city: "Hồ Chí Minh",
      },
      package_type: "normal",
      size: { width: "3", height: "3", weight: "3" },
    },
  },
  {
    message: "update packages state < 0 by admin response 400 ",
    expect: 400,
    type: "admin",
    send: {
      name: "a",
      len: "2",
      width: "2",
      height: "2",
      weight: "2",
      quantity: "",
      state: 0,
      street: "942/2 Kha Vạn Cân",
      ward: "Trường Thọ",
      province: "Thủ Đức",
      city: "Hồ Chí Minh",
      position: "",
      current_address: "",
      package_type: "normal",
      size: { width: "3", height: "3", weight: "3" },
    },
  },
  {
    message: "update packages without width by admin response 400 ",
    expect: 400,
    type: "admin",
    send: {
      name: "a",
      len: "2",
      width: "",
      height: "2",
      weight: "2",
      quantity: "1",
      state: 1,
      street: "942/2 Kha Vạn Cân",
      ward: "Trường Thọ",
      province: "Thủ Đức",
      city: "Hồ Chí Minh",
      position: "",
      package_type: "normal",
    },
  },
  // {
  //   message: "get packages by driver response 200 ",
  //   expect: 200,
  //   type: "driver",
  //   send: "",
  // },
];

it.each(testCaseData)("$message", async ({ expect, type, send }) => {
  await request(strapi.server)
    .put("/packages/" + variable("package"))
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken(type))
    .send(send)
    .expect("Content-Type", expect === 404 ? /text/ : /json/)
    .expect(expect);
});

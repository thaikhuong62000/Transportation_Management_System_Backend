const request = require("supertest");
const { jwtToken } = require("../__mocks__/AuthMocks");
const mockOrder = require("./mockOrder");

const testCaseData = [
  {
    message: "create order invalid package",
    mockData: mockOrder[1],
    expected: [{ message: "Invalid Package" }],
  },
  {
    message: "create order invalid package info",
    mockData: mockOrder[2],
    expected: [{ message: "Invalid Package Info" }],
  },
  {
    message: "create order invalid package size",
    mockData: mockOrder[3],
    expected: [{ message: "Invalid Package Size" }],
  },
  {
    message: "create order invalid info",
    mockData: mockOrder[4],
    expected: [{ id: "order.create", message: "Invalid order information" }],
  },
];

it.each(testCaseData)("$message", async ({ message, mockData, expected }) => {
  await request(strapi.server)
    .post("/orders")
    .set("accept", "application/json")
    .set("Content-Type", "application/json")
    .set("Authorization", "Bearer " + jwtToken("customer"))
    .send(mockData)
    .expect("Content-Type", /json/)
    .expect(400)
    .then((data) => {
      expect(data.body).toBeDefined();
      expect(data.body.message).toStrictEqual(expected);
    });
});

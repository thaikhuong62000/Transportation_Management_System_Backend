let mockData = {
  users: {},
  jwts: {},
};

const processData = require("./processData")(mockData);

const createdUser = jest.fn((data, value) => {
  if (value) data = { key: data, value };
  return processData(data, "users");
});
const jwtToken = jest.fn((data, value) => {
  if (value) data = { key: data, value };
  return processData(data, "jwts");
});
const firebaseToken = jest.fn();

module.exports = { createdUser, jwtToken, firebaseToken };

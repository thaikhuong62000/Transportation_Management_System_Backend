let mockData = {
  users: {},
  jwts: {},
};

function processData(data, variable) {
  if (!Object.keys(mockData).find((x) => x === variable)) return undefined;

  switch (typeof data) {
    case "string":
      if (data === "CLEAN") {
        mockData[variable] = {};
        return mockData[variable];
      }
      return mockData[variable][data];
    case "object":
      mockData[variable] = { ...mockData[variable], [data.key]: data.value };
      return data.value;
    default:
      return mockData[variable];
  }
}

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

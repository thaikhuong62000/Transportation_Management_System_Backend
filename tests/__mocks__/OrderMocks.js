let mockData = {
  orders: {},
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

const createdOrder = jest.fn((data, value) => {
  if (value) data = { key: data, value };
  return processData(data, "orders");
});

module.exports = { createdOrder };
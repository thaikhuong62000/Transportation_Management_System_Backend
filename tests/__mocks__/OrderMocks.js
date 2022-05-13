let mockData = {
  orders: {},
};

const processData = require("./processData")(mockData);

const createdOrder = jest.fn((data, value) => {
  if (value) data = { key: data, value };
  return processData(data, "orders");
});

module.exports = { createdOrder };

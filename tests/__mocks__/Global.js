let mockData = {
  variable: {},
};

const processData = require("./processData")(mockData);

const variable = jest.fn((data, value) => {
  if (value) data = { key: data, value };
  return processData(data, "variable");
});

module.exports = { variable };

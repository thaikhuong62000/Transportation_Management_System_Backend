function processData(mockData, data, variable) {
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

module.exports = (mockData) => {
  function decoFunc(data, variable) {
    return processData(mockData, data, variable);
  }
  return decoFunc;
};

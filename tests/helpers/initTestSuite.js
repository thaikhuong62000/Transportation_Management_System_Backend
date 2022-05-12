const { setupStrapi } = require("./strapi");

jest.setTimeout(120000);

beforeAll(async () => {
  await setupStrapi();
});

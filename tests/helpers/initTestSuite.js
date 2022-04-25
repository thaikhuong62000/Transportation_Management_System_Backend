const { setupStrapi } = require("./strapi");

jest.setTimeout(60000);

beforeAll(async () => {
  await setupStrapi();
});

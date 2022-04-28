const request = require("supertest");

module.exports = async (phone, isFormatNeeded) => {
  const _phone = isFormatNeeded ? "+84" + phone.slice(1) : phone;

  let user;
  try {
    user = await strapi.firebase.auth.createUser({
      phoneNumber: _phone,
      disabled: false,
    });
  } catch (error) {
    user = await strapi.firebase.auth.getUserByPhoneNumber(_phone);
  }

  const customToken = await strapi.firebase.auth.createCustomToken(user.uid);

  const idToken = (
    await request("https://identitytoolkit.googleapis.com")
      .post(
        `/v1/accounts:signInWithCustomToken?key=` + process.env.FIREBASE_KEY
      )
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        token: customToken,
        returnSecureToken: true,
      })
      .expect("Content-Type", /json/)
      .expect(200)
  )?.body?.idToken;
  expect(idToken).toBeDefined();
  return idToken;
};

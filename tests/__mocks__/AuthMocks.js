const createdUser = jest.fn();
const jwtToken = jest.fn().mockImplementation((x) => x);
const firebaseToken = jest.fn();

module.exports = { createdUser, jwtToken, firebaseToken };

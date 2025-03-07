import Realm from "realm";

const app = new Realm.App({ id: "example-testers-kvjdy" });

describe("user authentication", () => {
  afterEach(async () => {
    await app.currentUser?.logOut();
    jest.runAllTimers();
  });

  test("anonymous login", async () => {
    // :snippet-start: anonymous-login
    // Create an anonymous credential
    const credentials = Realm.Credentials.anonymous();
    try {
      const user = await app.logIn(credentials);
      // :remove-start:
      expect(user.id).toBe(app.currentUser.id);
      // :remove-end:
      console.log("Successfully logged in!", user.id);
      return user;
    } catch (err) {
      console.error("Failed to log in", err.message);
    }
    // :snippet-end:
  });

  test("email/password login", async () => {
    const randomInt = Math.floor(Math.random() * Math.floor(200000));
    const username = "someone" + randomInt.toString() + "@example.com";

    // :snippet-start: register-email-pass-user
    // :replace-start: {
    //    "terms": {
    //       "username": "\"someone@example.com\""
    //    }
    // }
    await app.emailPasswordAuth.registerUser({
      email: username,
      password: "passw0rd",
    });
    // :replace-end:
    // :snippet-end:

    // :snippet-start: email-password-login
    // Create an email/password credential
    const credentials = Realm.Credentials.emailPassword(
      // :remove-start:
      username,
      // :remove-end:
      // :uncomment-start:
      // "someone@example.com",
      // :uncomment-end:
      "passw0rd"
    );
    try {
      const user = await app.logIn(credentials);
      // :remove-start:
      expect(user.id).toBe(app.currentUser.id);
      // :remove-end:
      console.log("Successfully logged in!", user.id);
      return user;
    } catch (err) {
      console.error("Failed to log in", err.message);
    }
    // :snippet-end:
  });

  test.skip("confirm email/pass user", async () => {
    // :snippet-start: confirm-email-pass-user
    const token = "someToken";
    const tokenId = "someTokenId";
    
    try {
      await app.emailPasswordAuth.confirmUser({ token, tokenId });
      // User email address confirmed.
      console.log("Successfully confirmed user.");
    } catch (err){
      console.log(`User confirmation failed: ${err}`);
    }
    // :snippet-end:
  });

  test.skip("resend confirmation email", async () => {
    // :snippet-start: resend-confirmation-email
    const email = "someone@example.com";
    await app.emailPasswordAuth.resendConfirmation({ email });
    // :snippet-end:
  });
  
  test.skip("retry a user confirmation function", async () => {
    // :snippet-start: retry-user-confirmation-function
    const email = "someone@example.com";
    await app.emailPasswordAuth.retryCustomConfirmation({ email });
    // :snippet-end:
  });

  test.skip("send password reset email", async () => {
    // :snippet-start: send-pass-reset-email
    const email = "someone@example.com"
    await app.emailPasswordAuth.sendResetPasswordEmail({ email });
    // :snippet-end:
  });

  test.skip("call a password reset function", async () => {
    // :snippet-start: call-password-reset-function
    const email = "someone@example.com";
    // The new password to use
    const password = "newPassw0rd";
    // Additional arguments for the reset function
    const args = [];

    await app.emailPasswordAuth.callResetPasswordFunction({ email, password }, args);
    // :snippet-end:
  });
  
  test.skip("complete password reset", async () => {
    // :snippet-start: complete-pass-reset
    await app.emailPasswordAuth.resetPassword({ password: "newPassw0rd", token, tokenId });
    // :snippet-end:
  });

  test.skip("create user api key", async () => {
    // :snippet-start: create-user-api-key
    const user = app.currentUser;
    const key = await user.apiKeys.create("apiKeyName");
    // :snippet-end:
  });

  test.skip("look up user api key", async () => {
    // :snippet-start: look-up-user-api-key
    const user = app.currentUser;
    // List all of a user's keys
    const keys = await user.apiKeys.fetchAll();
    // Get a specific key by its ID
    const key = await user.apiKeys.fetch("5eb5931548d79bc784adf46e");
    // :snippet-end:
  });

  test.skip("enable or disable user api key", async () => {
    // :snippet-start: enable-disable-user-api-key
    // Get the ID of a User API Key
    const user = app.currentUser;
    const apiKeys = await user.apiKeys.fetchAll();
    const keyId = apiKeys[0]["_id"];

    // Enable the User API Key
    await user.apiKey.enable(keyId);
    // Disable the User API Key
    await user.apiKey.disable(keyId);
    // :snippet-end:
  });

  test.skip("delete user api key", async () => {
    // :snippet-start: delete-user-api-key
    // Get the ID of a User API Key
    const user = app.currentUser;
    const apiKeys = await user.apiKeys.fetchAll();
    const keyId = apiKeys[0]["_id"];

    // Delete the User API Key
    await user.apiKey.delete(keyId);
    // :snippet-end:
  });

  test("server api key login", async () => {
    process.env.realmApiKey = "ceb9d97d12f398c284f8";
    // :snippet-start: server-api-key-login
    // Get the API key from the local environment
    const apiKey = process.env.realmApiKey;
    if (!apiKey) {
      throw new Error("Could not find a Realm Server API Key.");
    }
    // Create an api key credential
    const credentials = Realm.Credentials.apiKey(apiKey);
    try {
      const user = await app.logIn(credentials);
      console.log("Successfully logged in!", user.id);
      return user;
    } catch (err) {
      console.error("Failed to log in", err.message);
    }
    // :snippet-end:
  });

  test("custom function login", async () => {
    // :snippet-start: custom-function-login
    // Create a custom function credential
    const credentials = Realm.Credentials.function({
      username: "ilovemongodb",
    });
    try {
      const user = await app.logIn(credentials);
      // :remove-start:
      expect(user.id).toBe(app.currentUser.id);
      // :remove-end:
      console.log("Successfully logged in!", user.id);
      return user;
    } catch (err) {
      console.error("Failed to log in", err.message);
    }
    // :snippet-end:
  });

  test("custom jwt login", async () => {
    const authenticateWithExternalSystem = () => {
      // Simulates returning the following JWT information from an external auth service
      // JWT: {
      //   header: {
      //     "alg": "HS256",
      //     "typ": "JWT",
      //   },
      //   payload: {
      //     "aud": "example-testers-kvjdy",
      //     "sub": "example-user",
      //     "exp": 1918062398,
      //     "name": "Joe Jasper",
      //   },
      //   secret: "E7DE0D13D66BF64EC9A9A74A3D600E840D39B4C12832D380E48ECE02070865AB"
      // }
      //
      return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJleGFtcGxlLXRlc3RlcnMta3ZqZHkiLCJzdWIiOiJleGFtcGxlLXVzZXIiLCJuYW1lIjoiSm9lIEphc3BlciIsImV4cCI6MTkxODA2MjM5OH0.3wR1cJN4zlbbDh7IaYyDX0fasNEW3grJCdv_7lQFnPI";
    };
    // :snippet-start: custom-jwt-login
    // Create a custom jwt credential
    const jwt = await authenticateWithExternalSystem();
    const credentials = Realm.Credentials.jwt(jwt);
    try {
      const user = await app.logIn(credentials);
      // :remove-start:
      expect(user.id).toBe(app.currentUser.id);
      // :remove-end:
      console.log("Successfully logged in!", user.id);
      return user;
    } catch (err) {
      console.error("Failed to log in", err.message);
    }
    // :snippet-end:
  });

  test("logout", async () => {
    const emailPasswordCredentials = Realm.Credentials.emailPassword(
      "someone@example.com",
      "passw0rd"
    );
    const functionCredentials = Realm.Credentials.function({
      username: "ilovemongodb",
    });
    try {
      const emailPasswordUser = await app.logIn(emailPasswordCredentials);
      const functionUser = await app.logIn(functionCredentials);
      expect(functionUser.id).toBe(app.currentUser.id);

      // :snippet-start: logout
      // Log out the current user
      await app.currentUser.logOut();
      // :remove-start:
      expect(emailPasswordUser.id).toBe(app.currentUser.id);
      // :remove-end:
      // Log out a specific user by ID
      await app.allUsers[app.currentUser.id].logOut();
      // :snippet-end:
    } catch (err) {
      console.error(err.message);
    }
  });

  test("Delete user", async () => {
    const credentials = Realm.Credentials.anonymous();
    await app.logIn(credentials);
    const uid = app.currentUser.id;
    const preDeleteMatchesLen = Object.keys(app.allUsers).filter(
      (id) => id === uid
    ).length;
    expect(preDeleteMatchesLen).toBe(1);
    // :snippet-start: delete-user
    await app.deleteUser(app.currentUser);
    // :snippet-end:
    const postDeleteMatchesLen = Object.keys(app.allUsers).filter(
      (id) => id === uid
    ).length;
    expect(postDeleteMatchesLen).toBe(0);
  });

  test("read user metadata", async () => {
    const randomInt = Math.floor(Math.random() * Math.floor(200000));
    const email = "someone" + randomInt.toString() + "@example.com";
    const password = "passw0rd";

    await app.emailPasswordAuth.registerUser({
      email: email,
      password: password,
    });

    // :snippet-start: user-metadata
    try {
    // :replace-start: {
    //    "terms": {
    //       "email": "<email>",
    //       "password": "<password>"
    //    }
    // }
      await app.logIn(Realm.Credentials.emailPassword(email, password));
    // :replace-end:
    } catch (err) {
      console.error("Failed to log in", err.message);
    }
    
    const userEmail = app.currentUser.profile.email;
    // :snippet-end:

    expect(userEmail).toBe(email);

    await app.deleteUser(app.currentUser);
  });
});

describe("User Sessions", () => {
  test("Get a User Access Token", async () => {
    const email = "someone@example.com";
    const password = "pa55w0rd!";
    try {
      await app.logIn(Realm.Credentials.emailPassword(email, password));
    } catch (err) {
      await app.emailPasswordAuth.registerUser({ email, password });
      await app.logIn(Realm.Credentials.emailPassword(email, password));
    }
    // :snippet-start: get-user-access-token
    // Gets a valid user access token to authenticate requests
    async function getValidAccessToken(user) {
      // An already logged in user's access token might be stale. To
      // guarantee that the token is valid, refresh it if necessary.
      await user.refreshCustomData();
      return user.accessToken;
    }
    // :snippet-end:
    const token = await getValidAccessToken(app.currentUser);
    expect(token).not.toBe(undefined);
  });
})

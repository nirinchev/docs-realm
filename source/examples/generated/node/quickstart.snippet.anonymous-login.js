// Initialize your App.
const app = new Realm.App({
  id: "<yourAppId>",
});

// Authenticate an anonymous user.
await app.logIn(Realm.Credentials.anonymous());

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/tokens/:id/fetch/4c590453-68e8-49a5-b94b-3aababb9e5e2",
      handler: "token.fetchData",
      config: { auth: false },
    },
  ],
};

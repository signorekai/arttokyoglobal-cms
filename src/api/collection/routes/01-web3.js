module.exports = {
  routes: [
    {
      method: "GET",
      path: "GET",
      path: "/collections/:id/4c590453-68e8-49a5-b94b-3aababb9e5e2",
      handler: "collection.fetchABI",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "GET",
      path: "/collections/:id/data/4c590453-68e8-49a5-b94b-3aababb9e5e2",
      handler: "collection.fetchData",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "GET",
      path: "/collections/:id/tokens/4c590453-68e8-49a5-b94b-3aababb9e5e2",
      handler: "collection.fetchAllTokens",
      config: { auth: false },
    },
  ],
};

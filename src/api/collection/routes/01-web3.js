module.exports = {
  routes: [
    {
      method: "GET",
      path: "/collections/:id/4c590453-68e8-49a5-b94b-3aababb9e5e2",
      handler: "collection.fetchABI",
    },
    {
      method: "GET",
      path: "/collections/:id/data/4c590453-68e8-49a5-b94b-3aababb9e5e2",
      handler: "collection.fetchData",
    },
    {
      method: "GET",
      path: "/collections/:id/tokens/4c590453-68e8-49a5-b94b-3aababb9e5e2",
      handler: "collection.fetchAllTokens",
    },
    {
      method: "DELETE",
      path: "/collections/:id/tokens/4c590453-68e8-49a5-b94b-3aababb9e5e2",
      handler: "collection.deleteAllTokens",
    },
    {
      method: "GET",
      path: "/collections/:id/whitelist/:address",
      handler: "collection.checkWhitelist",
    },
  ],
};

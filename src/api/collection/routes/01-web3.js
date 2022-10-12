module.exports = {
  routes: [
    {
      method: "GET",
      path: "/collections/fetch/4c590453-68e8-49a5-b94b-3aababb9e5e2",
      handler: "collection.fetchAllData",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "GET",
      path: "/collections/:id/fetch/4c590453-68e8-49a5-b94b-3aababb9e5e2",
      handler: "collection.fetchData",
      config: { auth: false },
    },
  ],
};

module.exports = {
  routes: [
    {
      method: "GET",
      path: `/collections/fetch/${process.env.WEB3_UUID}`,
      handler: "collection.fetchAllData",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "GET",
      path: `/collections/:id/fetch/${process.env.WEB3_UUID}`,
      handler: "collection.fetchData",
      config: { auth: false },
    },
  ],
};

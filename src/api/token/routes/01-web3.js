module.exports = {
  routes: [
    {
      method: "GET",
      path: `/tokens/:id/fetch/${process.env.WEB3_UUID}`,
      handler: "token.fetchData",
      config: { auth: false },
    },
  ],
};

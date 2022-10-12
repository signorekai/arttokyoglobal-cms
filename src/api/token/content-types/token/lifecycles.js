module.exports = {
  async beforeUpdate(event) {
    const { data, where } = event.params;
    const id = where.id;
    const entry = await strapi.entityService.findOne("api::token.token", id);

    event.state.changedCachedData = false;

    const { cachedData } = data;
    if (cachedData) {
      event.params.data = {
        ...event.params.data,
        ...strapi.service("api::token.web3").parseTokenMetadata(cachedData),
      };
    }

    if (data.mediaIpfsUri !== entry.mediaIpfsUri) {
      event.state.changedMediaIpfs = true;
      // event.params.data = {
      //   ...event.params.data,
      //   mediaIpfsUri: strapi
      //     .service("api::token.web3")
      //     .parseTokenMetadata(
      //       params.data.cachedData ? params.data.cachedData : entry.cachedData
      //     ).mediaIpfsUri,
      // };
    }

    return event;
  },
  async afterUpdate(event) {
    const { state, result } = event;
  },
  async beforeCreate(event) {
    const { params } = event;
    if (params.data.cachedData) {
      const { cachedData } = params.data;
      event.params.data = {
        ...event.params.data,
        ...strapi.service("api::token.web3").parseTokenMetadata(cachedData),
      };
    }
    return event;
  },
};

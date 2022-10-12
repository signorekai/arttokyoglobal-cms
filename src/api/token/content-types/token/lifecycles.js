function getNewAttributes(data) {
  return {
    ipfsUri: data.fileName,
    title: data.name,
    tokenAttributes: data.attributes,
    tokenId: `${data.token_id}`,
    collection: data.project_id,
    mediaIpfsUri: data.image.substring(7),
  };
}

module.exports = {
  async beforeUpdate(event) {
    const { params } = event;
    const id = params.where.id;
    const entry = await strapi.entityService.findOne("api::token.token", id);

    event.state.changedCachedData = false;

    if (
      JSON.stringify(entry.cachedData) !==
      JSON.stringify(params.data.cachedData)
    ) {
      event.state.changedCachedData = true;

      const { cachedData } = params.data;

      event.params.data = {
        ...event.params.data,
        ...getNewAttributes(cachedData),
      };
    }

    if (params.data.mediaIpfsUri !== entry.mediaIpfsUri) {
      event.state.changedMediaIpfs = true;
      event.params.data = {
        ...event.params.data,
        mediaIpfsUri: getNewAttributes(
          params.data.cachedData ? params.data.cachedData : entry.cachedData
        ).mediaIpfsUri,
      };
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
        ...getNewAttributes(cachedData),
      };
    }
    return event;
  },
};

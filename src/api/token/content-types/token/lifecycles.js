const fetch = require("node-fetch");
const FormData = require("form-data");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");

module.exports = {
  async beforeUpdate(event) {
    const { data, where } = event.params;
    const id = where.id;
    console.log("beforeUpdate", id);
    const entry = await strapi.entityService.findOne("api::token.token", id, {
      populate: "image",
    });

    event.state.changedCachedData = false;

    const { cachedData } = data;
    if (cachedData) {
      event.params.data = {
        ...event.params.data,
        ...strapi.service("api::token.web3").parseTokenMetadata(cachedData),
      };
    }
    if (data.mediaIpfsUri !== entry.mediaIpfsUri && !!entry.image === false) {
      event.state.changedMediaIpfs = true;

      const uploaded = await strapi
        .service("api::token.web3")
        .downloadImageAndUpload(
          `${process.env.IPFS_GATEWAY}/ipfs/${event.params.data.mediaIpfsUri}`,
          `${event.params.data.title}.${
            event.params.data.mediaIpfsUri.split(".")[1]
          }`
        );
      event.params.data.image = uploaded[0].id;
    }

    if (!data.slug) {
      event.params.data.slug = `${slugify(event.params.data.title, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
      })}-${uuidv4()}`;
    }

    return event;
  },
  async afterUpdate(event) {
    const { state, result } = event;
  },
  async beforeCreate(event) {
    // console.log("beforeCreate");
    const { params } = event;
    if (params.data.cachedData) {
      const { cachedData } = params.data;
      event.params.data = {
        ...event.params.data,
        ...strapi.service("api::token.web3").parseTokenMetadata(cachedData),
      };
    }

    if (!event.params.data.slug) {
      event.params.data.slug = `${slugify(event.params.data.title, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
      })}-${uuidv4()}`;
    }

    if (event.params.data.mediaIpfsUri && !!event.params.data.image === false) {
      const uploaded = await strapi
        .service("api::token.web3")
        .downloadImageAndUpload(
          `${process.env.IPFS_GATEWAY}/ipfs/${event.params.data.mediaIpfsUri}`,
          `${event.params.data.title}.${
            event.params.data.mediaIpfsUri.split(".")[1]
          }`
        );
      event.params.data.image = uploaded[0].id;
    }

    return event;
  },
};

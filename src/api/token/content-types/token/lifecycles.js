const fetch = require("node-fetch");
const FormData = require("form-data");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");

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
      console.log(`ipfs://${event.params.data.mediaIpfsUri}`);

      const response = await fetch(
        `${process.env.IPFS_GATEWAY}/ipfs/${event.params.data.mediaIpfsUri}`
      );
      const arrayBuffer = await response.arrayBuffer();
      const img = Buffer.from(arrayBuffer);

      var form = new FormData();
      form.append(
        "files",
        img,
        `${event.params.data.title}.${
          event.params.data.mediaIpfsUri.split(".")[1]
        }`
      );

      const formResponse = await fetch(`${process.env.CLIENT_URL}/api/upload`, {
        method: "post",
        headers: {
          Authorization: `Bearer ${process.env.UPLOAD_TOKEN}`,
        },
        body: form,
      });

      const uploaded = await formResponse.json();
      event.params.data.image = uploaded[0].id;
    }

    if (!data.slug) {
      event.params.data.slug = `${slugify(event.params.data.title, {
        lower: true,
      })}-${uuidv4()}`;
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

    if (!data.slug) {
      event.params.data.slug = `${slugify(event.params.data.title, {
        lower: true,
      })}-${uuidv4()}`;
    }

    return event;
  },
};

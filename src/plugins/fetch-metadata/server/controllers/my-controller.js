'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('fetch-metadata')
      .service('myService')
      .getWelcomeMessage();
  },
});

# Art Tokyo Global CMS

Built with [Strapi](https://strapi.io). [CLI docs here](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html).

## 🚨 Commit format

Please follow [Gitmoji](https://gitmoji.dev/) for your commit messages

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/developer-docs/latest/developer-resources/cli/CLI.html#strapi-build)

```
npm run build
# or
yarn build
```

## Server requirements

- Ubuntu: 22.04
- Node.js: lts/fermium (installed using `nvm`)
- PM2: latest (for CI/CD - check `package.json`)

## ⚙️ Deployment

- Strapi: 4.4.1
- DB: SQLite (/.tmp/data.db, backups via [Litestream](https://litestream.io) to our [DigitalOcean Space](https://cloud.digitalocean.com/spaces/atg-cdn?i=55f5e7&path=db%2F). Check Litestream docs on how to restore)

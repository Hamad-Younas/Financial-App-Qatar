const {defineConfig} = require('drizzle-kit');

module.exports = defineConfig({
    dialect:"sqlite",
    dbCredentials: {
        url: "./database/app.sqlite",
    },
    schema: "./app/models/lookup.js",
    out: "./app/models",
  // Your configuration here
});
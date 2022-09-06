const fs = require('fs')
const { port, storePort } = require('../config.ts')

fs.writeFileSync(
  '.env',
  `VUE_APP_SERVER_PORT=${port}\nVUE_APP_STORE_PORT=${storePort}`,
  'utf-8'
)

console.log(port, storePort)

const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

console.log(process.env.VUE_APP_SERVER_PORT, process.env.VUE_APP_STORE_PORT)

const BASE_URL = `http://localhost:${process.env.VUE_APP_SERVER_PORT}`
const STORE_URL = `http://localhost:${process.env.VUE_APP_STORE_PORT}`

export { BASE_URL, STORE_URL }

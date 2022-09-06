
const { storePort } = require("../config")

const http = require('http')
import express from 'express'

const app = express()
const server = http.createServer()

app.use(express.static(__dirname))

app.listen(storePort, () => {
    console.log(` Store is running at: http://localhost:${storePort}`)
})


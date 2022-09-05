require("dotenv").config()

import express from 'express'

const port = process.env.STORE_PORT

const app = express()
app.use(express.static("./"))

app.listen(port, () => {
    console.log(` Store is running at: http://localhost${port}`)
})
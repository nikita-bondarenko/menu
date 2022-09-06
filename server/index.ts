const { port } = require("../config")

import express from 'express'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import fs from "fs/promises"
import path from 'path'
import multer from 'multer'

const storePort = process.env.STORE_PORT
const app = express()
const prisma = new PrismaClient()
app.use(cors())
app.use(express.json())
app.use(express.static("client/dist"))

const uploadsDir = path.join(__dirname, "..", "store")

const upload = multer({
  dest: uploadsDir,
  fileFilter: (req: express.Request, file: any, callback) => {
    callback(null, file.mimetype.match(/^image\//))
  },
  limits: {
    fileSize: 2 * 1024 * 1024
  }
})
app.post("/upload/", upload.single('image'), async (req: express.Request, res: express.Response,) => {
  try {
    res.status(201).json({ imageName: req.file?.filename })
  } catch (err) {
    res.status(400).json(err)
  }
})


app.get("/category", async (req, res) => {
  try {
    const categories = await prisma.category.findMany()
    res.json({ categories })
  } catch (err) {
    res.status(400).send(err)
  }
})

app.get("/category/:id", async (req, res) => {
  try {
    const { id } = req.params
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        dishes: {
          orderBy: {
            name: 'asc'
          },
          include: {
            ingredients: true
          }
        }
      },

    })
    res.json({ category })
  } catch (err) {
    res.status(400).send(err)
  }
})



app.post("/category", async (req, res) => {
  try {
    const category = await prisma.category.create({
      data: { ...req.body }
    })
    res.json({ category })
  } catch (err) {
    res.status(400).send(err)
  }
})

app.put("/category/:id", async (req, res) => {
  try {
    const { id } = req.params
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: { ...req.body }
    })
    res.json({ category })
  } catch (err) {
    res.status(400).send(err)
  }
})

app.delete("/category/:id", async (req, res) => {
  try {
    const { id } = req.params

    const ingredients = await prisma.ingredient.deleteMany({
      where: { categoryId: Number(id) }
    })

    const dishes = await prisma.dish.findMany({
      where: { categoryId: Number(id) }
    })

    dishes.forEach(item => item.imageName ? fs.unlink(path.join(uploadsDir, item.imageName)) : 1)

    if (dishes) {
      const deletedDishes = await prisma.dish.deleteMany({
        where: { categoryId: Number(id) }
      })

      const category = await prisma.category.delete({
        where: { id: Number(id) }
      })

      res.json({ category, deletedDishes: deletedDishes.count, deletedIngredients: ingredients.count })
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

app.get('/dish/:id', async (req, res) => {
  try {
    const { id } = req.params
    const dish = await prisma.dish.findUnique({
      where: { id: Number(id) },
      include: {
        ingredients: true
      }
    })
    res.json(dish)
  } catch (err) {
    res.send(err)

  }
})

app.post("/dish", async (req, res) => {
  try {

    let { ingredients, name, imageName, weight, price, enValue, description, categoryId } = req.body
    delete req.body.ingredients
    ingredients = ingredients.reduce((arr: any, item: { name: any }) => item.name ? [...arr, item] : arr, []).map((item: { id: any }) => {
      delete item.id
      return item
    })

    const dish = await prisma.dish.create({
      data: {
        imageName,
        name,
        weight, price, enValue, description, categoryId,
        ingredients: {
          createMany: {
            data: ingredients
          }
        }
      }

    })
    res.json({ dish })
  } catch (err) {
    res.status(400).send(err)
  }
})

app.delete("/dish/:id", async (req, res) => {
  try {
    const { id } = req.params


    const { count } = await prisma.ingredient.deleteMany({
      where: { dishId: Number(id) }
    })

    const dish = await prisma.dish.delete({
      where: { id: Number(id) }
    })

    dish.imageName && fs.unlink(path.join(uploadsDir, dish.imageName))

    res.json({ dish, deletedIngredients: count })
  } catch (err) {
    res.status(400).send(err)
  }
})

app.put("/dish/:id", async (req, res) => {
  try {
    const { id } = req.params
    let { ingredients, name, imageName, weight, price, enValue, description, categoryId } = req.body

    ingredients = ingredients.reduce((arr: any, item: { name: any }) => item.name ? [...arr, item] : arr, []).map((item: { id: any, dishId: any }) => {
      delete item.id
      delete item.dishId
      return item
    })
    const dish = await prisma.dish.update({
      where: { id: Number(id) },
      data: {
        imageName,
        name,
        weight, price, enValue, description, categoryId,
        ingredients: {
          createMany: {
            data: ingredients
          }
        }
      }

    })
    res.json({ dish })
  } catch (err) {
    res.status(400).send(err)
  }
})


app.delete("/ingredient/:id", async (req, res) => {
  try {
    const { id } = req.params
    const ingredients = await prisma.ingredient.deleteMany({
      where: { dishId: Number(id) }
    })
    res.json({ deleted: ingredients.count })
  } catch (err) {
    res.status(400).send(err)
  }
})


app.listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}`)
})




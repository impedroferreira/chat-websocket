import 'reflect-metadata'
import express from 'express'
import path from 'path'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'

const app = express()

const server = createServer(app)

mongoose.connect("mongodb://localhost/4", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.use(express.static(path.join(__dirname, '..', 'public')))
app.use(cors())
const io = new Server(server)

io.on("connection", (socket) => {
  console.log("Socket", socket.id)
})

app.get('/', (req, res) => {
  return res.json({
    message: "hello web socket"
  })
})

export { server, io }
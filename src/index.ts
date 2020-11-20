import { Server, Socket } from 'socket.io'
import * as express from 'express'
import * as multer from 'multer'
import * as http from 'http'
import { setInterval } from 'timers'

const upload = multer()
const app = express()
const server = http.createServer(app)
const images: Buffer[] = []

app.post('/upload', upload.single('image'), (req) => {
  console.log('uploaded')
  images.push(req.file.buffer)
  if (images.length === 10) {
    images.pop()
  }
})

const io = new Server(server, {
  cors: {
    origin: '*',
  },
})

io.on('connection', (socket: Socket) => {
  if (images[0]) {
    socket.emit('image', images[0])
  }
})

let i = 0
setInterval(() => {
  if (!images[0]) {
    return
  }

  if (!images[i]) {
    i = 0
  }

  console.log('changed', i)
  io.emit('image', images[i])
  i++
  i %= images.length
}, 1000)

server.listen(8000)

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

import { connectDB } from './config/db.js'
import notesRoutes from './routes/notesRoutes.js'
import rateLimiter from './middleware/rateLimiter.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// middleware
app.use(express.json()) // this middleware will parse JSON bodies: req.body
// app.use(cors({ origin: 'http://localhost:5001' }));
app.use(rateLimiter)

// our simple custom middleware
// app.use((req, res, next) => {
//   console.log(`Req method is ${req.method} & Req URL is ${req.url}`)
//   next()
// })

app.use('/api/notes', notesRoutes)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on PORT:`, PORT)
  })
})

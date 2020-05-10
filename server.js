const compression = require('compression')
const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const isProduction = process.env.NODE_ENV === "production"

const PORT = process.env.PORT || 3000

//ARQUIVOS ESTÁTICOS

app.use('/public/images', express.static(__dirname + '/public/images'))
app.use('/public', express.static(__dirname + '/public'))

//MONGODB

const db = require('./config/database')
const dbURI = isProduction ? db.dbProduction : db.dbTest

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

//SETUP EJS

app.set('view engine', 'ejs')

//CONFIGURACOES
if (!isProduction) app.use(morgan('dev'))
app.use(cors())
app.disable('x-powered-by')
app.use(compression())


//SETUP BODY PARSER

app.use(bodyParser.urlencoded({ extended: true, limit: 1.5 * 1024 * 1024 }))
app.use(bodyParser.json({ limit: 1.5 * 1024 * 1024 }))

//MODELS
require('./models')

//ROTAS
app.use("/", require("./routes"))

//404- Rota
app.use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})

//ROTA 422, 500, 401
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    if (err.status !== 404) console.warn('Error:', err.message, new Date())
    res.json(err)
})

//Escutar Servidor

app.listen(PORT, (err) => {
    if (err) throw err
    console.log(`Server rodando na porta ${PORT}`)
})
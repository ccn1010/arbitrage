const express = require('express')

const currency = require('./currency')

const router = express.Router()

router.use('/currency', [], currency)

module.exports = router

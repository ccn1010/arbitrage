const express = require('express')

const trade = require('./trade')
const getCycles = require('./get-cycles')
const getGraph = require('./get-graph')

const router = express.Router()

router.post('/trade', [], trade)
router.post('/get-cycles', [], getCycles)
router.get('/get-graph', [], getGraph)

module.exports = router

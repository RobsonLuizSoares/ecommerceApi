const router = require('express').Router()

router.use('/v1/api', require('./api/v1/'))
router.get('/', (req, res) => {
    res.send('Ok')
})


module.exports = router
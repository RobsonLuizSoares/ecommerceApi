const router = require('express').Router()

const auth = require('../../auth')
const Validation = require('express-validation')
const { LojaValidation } = require('../../../controllers/validacoes/lojaValidation')

const LojaController = require('../../../controllers/LojaController')
const lojaController = new LojaController()

router.get('/', lojaController.index) // verified
router.get('/:id', Validation(LojaValidation.show), lojaController.show) // verified

router.post('/', auth.required, Validation(LojaValidation.store), lojaController.store) // verified
router.put('/:id', auth.required, LojaValidation.admin, Validation(LojaValidation.update), lojaController.update)// verified
router.delete('/:id', auth.required, LojaValidation.admin, lojaController.remove)// verified

module.exports = router
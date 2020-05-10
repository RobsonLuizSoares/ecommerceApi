const router = require('express').Router()
const auth = require('../../auth')
const UsuarioController = require('../../../controllers/UsuarioController')
const Validation = require('express-validation')
const { UsuarioValidation } = require('../../../controllers/validacoes/usuarioValidation')
const usuarioController = new UsuarioController()

router.post('/login', Validation(UsuarioValidation.login), usuarioController.login) //validated
router.post('/registrar', Validation(UsuarioValidation.store), usuarioController.store) // validated
router.put('/', auth.required, Validation(UsuarioValidation.update), usuarioController.update) //validated
router.delete('/', auth.required, usuarioController.remove)//validated

router.get('/recuperar-senha', usuarioController.showRecovery) // validated
router.post('/recuperar-senha', usuarioController.createRecovery)// validated
router.get('/senha-recuperada', usuarioController.showCompleteRecovery)// validated
router.post('/senha-recuperada', usuarioController.completeRecovery)// validated

router.get('/', auth.required, usuarioController.index) // validated
router.get('/:id', auth.required, Validation(UsuarioValidation.show), usuarioController.show) // validated

module.exports = router
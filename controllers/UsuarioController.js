const mongoose = require('mongoose')

const Usuario = mongoose.model('Usuario')

const enviarEmailRecovery = require('../helpers/email-recovery')

class UsuarioController {
    index(req, res, next) {
        Usuario
            .findById(req.payload.id)
            .then(usuario => {
                if (!usuario) return res.status(401).json({ errors: "Usuário não registrado" })
                return res.json({ usuario: usuario.enviarAuthJSON() })
            }).catch(next)
    }

    //GET /:id
    show(req, res, next) {
        Usuario.findById(req.params.id)
            .populate({ path: "loja" })
            .then(usuario => {
                if (!usuario) return res.status(401).json({ errors: "Usuário não registrado" })
                return res.json({
                    usuario: {
                        nome: usuario.nome,
                        email: usuario.email,
                        permissao: usuario.permissao,
                        loja: usuario.loja
                    }
                })
            }).catch(next)
    }

    //POST /registrar
    store(req, res, next) {
        const { nome, email, password, loja } = req.body

        const usuario = new Usuario({ nome, email, loja })
        usuario.setSenha(password)
        usuario.save()
            .then(() => res.json({ usuario: usuario.enviarAuthJSON() }))
            .catch((err) => {
                if (err) console.log(err)
                next(err)
            })
    }

    //PUT /
    update(req, res, next) {
        const { nome, email, password } = req.body
        Usuario.findById(req.payload.id).then((usuario) => {
            if (!usuario) return res.status(401).json({ errors: "Usuário não registrado" })
            if (typeof nome !== "undefined") usuario.nome = nome
            if (typeof email !== "undefined") usuario.email = email
            if (typeof password !== "undefined") usuario.setSenha(password)

            return usuario.save().then(() => {
                return res.json({ usuario: usuario.enviarAuthJSON() })
            }).catch(next)
        }).catch(next)
    }

    //DELETE /
    remove(req, res, next) {
        Usuario.findById(req.payload.id).then(usuario => {
            if (!usuario) return res.status(401).json({ errors: "Usuário não registrado" })
            return usuario.remove().then(() => {
                return res.json({ deletado: true })
            }).catch(next)
        }).catch(next)
    }

    //POST /login
    login(req, res, next) {
        const { email, password } = req.body
        Usuario.findOne({ email }).then((usuario) => {
            if (!usuario) return res.status(401).json({ errors: "Usuário não registrado" })
            if (!usuario.validarSenha(password)) return res.status(401).json({ errors: "Senha Inválida" })
            return res.json({ usuario: usuario.enviarAuthJSON() })
        }).catch(next)

    }


    //RECOVERY
    //GET /recuperar-senha
    showRecovery(req, res, next) {
        /* res.send('Olá Mundo') */
        return res.render("recovery", { errors: null, success: null })
    }

    //POST  /recuperar-senha
    createRecovery(req, res, next) {
        const { email } = req.body
        if (!email) return res.render("recovery", { errors: "Preencha com seu email", success: null })

        Usuario.findOne({ email }).then((usuario) => {
            if (!usuario) return res.render("recovery", { errors: "Não existe usuário cadastrado com este email", success: null })
            const recoveryData = usuario.criarTokenRecuperacaoSenha()
            return usuario.save().then(() => {
                enviarEmailRecovery({ usuario, recovery: recoveryData }, (errors = null, success = null) => {
                    return res.render("recovery", { errors, success })
                })
            }).catch(next)
        }).catch(next)
    }

    //GET /senha-recuperada
    showCompleteRecovery(req, res, next) {
        if (!req.query.token) return res.render("recovery", { errors: "Token não identificado", success: null })
        Usuario.findOne({ "recovery.token": req.query.token }).then(usuario => {
            if (!usuario) return res.render("recovery", { errors: "Não existe usuário com este token", success: null })
            if (new Date(usuario.recovery.date) < new Date()) return res.render("recovery", { errors: "Token expirado. Tente novamente", success: null })
            return res.render('recovery/store', { errors: null, success: null, token: req.query.token })
        }).catch(next)
    }

    //POST /senha-recuperada
    completeRecovery(req, res, next) {
        const { token, password } = req.body
        if (!token || !password) return res.render('recovery/store', { errors: 'Preencha novamente com sua nova senha' })
        Usuario.findOne({ "recovery.token": token }).then(usuario => {
            if (!usuario) return res.render('recovery', { errors: 'Usuário não identificado', success: null })

            usuario.finalizarTokenRecuperacaoSenha()
            usuario.setSenha(password)
            return usuario.save().then(() => {
                return res.render('recovery/store', {
                    errors: null,
                    success: 'Senha alterada com sucesso. Tente fazer o login novamente',
                    token: null
                })
            })
        }).catch(next)
    }

}

module.exports = UsuarioController
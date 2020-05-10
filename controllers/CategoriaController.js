const mongoose = require('mongoose')

const Categoria = mongoose.model('Categoria')
const Produto = mongoose.model('Produto')

class CategoriaController {

    //GET /index

    index(req, res, next) {
        Categoria
            .find({ loja: req.query.loja })
            .select('_id produtos nome codigo loja')
            .then((categorias) => res.send({ categorias }))
            .catch(next)
    }

    //GET /disponiveis

    indexDisponiveis(req, res, next) {
        Categoria
            .find({ loja: req.query.loja, disponibilidade: true })
            .select('_id produtos nome codigo loja')
            .then((categorias) => res.send({ categorias }))
            .catch(next)
    }

    //GET /:id

    show(req, res, next) {
        Categoria
            .findOne({ lojas: req.query.loja, _id: req.params.id })
            .select('_id produtos nome codigo loja ')
            .populate(['produtos'])
            .then((categoria) => res.send({ categoria }))
            .catch(next)
    }

    //POST  /
    store(req, res, next) {
        const { nome, codigo } = req.body
        const { loja } = req.query

        const categoria = new Categoria({ nome, codigo, loja, disponibilidade: true })
        categoria
            .save()
            .then(() => res.send({ categoria }))
            .catch(next)
    }

    //PUT :id update

    async update(req, res, next) {
        try {
            const { nome, codigo, disponibilidade, produtos } = req.body
            const categoria = await Categoria.findById(req.params.id)

            if (nome) categoria.nome = nome
            if (disponibilidade !== undefined) categoria.disponibilidade = disponibilidade
            if (codigo) categoria.codigo = codigo
            if (produtos) categoria.produtos = produtos

            await categoria.save()
            return res.send({ categoria })

        } catch (error) {
            next(error)
        }
    }

    async remove(req, res, next) {
        try {
            const categoria = await Categoria.findById(req.params.id)
            await categoria.remove()
            return res.send({ deletado: true })
        } catch (error) {
            next(error)
        }
    }

    /* PRODUTOS */

    //GET /:id/produtos
    async showProdutos(req, res, next) {
        const { offset, limit } = req.query
        try {
            const produtos = await Produto.paginate(
                { categoria: req.params.id },
                { offset: Number(offset) || 0, limit: Number(limit) || 30 }
            )
            return res.send({ produtos })
        } catch (error) {
            next(error)
        }
    }

    //PUT /:id/produtos
    async updateProdutos(req, res, next) {
        try {
            const categoria = await Categoria.findById(req.params.id)
            const { produtos } = req.body
            if (produtos) categoria.produtos = produtos
            await categoria.save()

            let _produtos = await Produto.find({
                $or: [
                    { categoria: req.params.id },
                    { _id: { $in: produtos } }
                ]
            })
            _produtos = await Promise.all(_produtos.map(async (produto) => {
                if (!produtos.includes(produto._id.toString())) {
                    produto.categoria = null
                } else {
                    produto.categoria = req.params.id
                }
                await produto.save()
                return produto
            }))

            const resultado = await Produto.paginate(
                { categoria: req.params.id },
                { offset: 0, limit: 30 }
            )
            return res.send({ produtos: resultado })
        } catch (error) {
            next(error)
        }
    }

}

module.exports = CategoriaController
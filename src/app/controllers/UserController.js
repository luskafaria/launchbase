const {
  unlinkSync
} = require('fs')

const {
  hash
} = require('bcryptjs')

const LoadProductService = require('../services/LoadProductService')
const User = require('../models/User')
const Product = require('../models/Product')

const Address = require('../models/Address')

const {
  formatCpfCnpj
} = require('../../lib/utils')


module.exports = {

  registerForm(req, res) {

    return res.render('users/register')
  },
  async show(req, res) {
    try {

      const {
        user
      } = req

      user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj)

      return res.render('users/index', {
        user
      })
    } catch (err) {
      console.error(err);

    }
  },
  async post(req, res) {
    try {

      let {
        name,
        email,
        password,
        cpf_cnpj
      } = req.body

      password = await hash(password, 8)
      cpf_cnpj = cpf_cnpj.replace(/\D/g, "")

      const userId = await User.create({
        name,
        email,
        password,
        cpf_cnpj
      })

      req.session.userId = userId

      let {
        cep,
        street,
        street_number,
        complement,
        neighborhood,
        city,
        state,
        status
      } = req.body

      cep = cep.replace(/\D/g, "")

      await Address.create({
        cep,
        street,
        street_number,
        complement,
        neighborhood,
        city,
        state,
        status: 1,
        user_id: userId
      })

      return res.redirect('/users')
    } catch (err) {
      console.error(err);
    }
  },
  async update(req, res) {
    try {
      const {
        user
      } = req

      console.log(user);

      let {
        name,
        email,
        cpf_cnpj,
        cep,
        street,
        street_number,
        complement,
        neighborhood,
        city,
        state
      } = req.body

      cpf_cnpj = cpf_cnpj.replace(/\D/g, "")
      cep = cep.replace(/\D/g, "")

      await User.update(user.id, {
        name,
        email,
        cpf_cnpj
      }).then(await Address.update(user.id, {
        cep,
        street,
        street_number,
        complement,
        neighborhood,
        city,
        state
      }))

      return res.render('users/index', {
        user: req.body,
        success: 'Conta atualizada com sucesso!'
      })
    } catch (err) {
      console.error(err);
      return res.render('users/index', {
        user,
        error: 'Algum erro aconteceu.'
      })
    }
  },
  async delete(req, res) {
    try {

      const products = await Product.findAll({
        where: {
          user_id: req.body.id
        }
      })

      //pegar todas as imagens
      const allFilesPromise = products.map(product =>
        Product.files(product.id))

      let promiseResults = await Promise.all(allFilesPromise)

      //rodar a remoção do usuário
      await User.delete(req.body.id)
      req.session.destroy()



      //remover as imagens da pasta public
      promiseResults.map(files => {
        files.map(file => {
          try {
            unlinkSync(file.path)
          } catch (err) {
            console.error(err);
          }
        })
      })

      return res.redirect('/users/login')
    } catch (err) {
      console.error(err);
      return res.render('session/login', {
        success: 'Erro ao deletar sua conta!'
      })
    }
  },
  async ads(req, res) {
    const products = await LoadProductService.load('products', {
      where: {
        user_id: req.session.userId
      }
    })

    return res.render('users/ads', {products})
  }
}
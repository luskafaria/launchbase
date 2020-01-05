const User = require('../models/User')
const {
  formatCep,
  formatCpfCnpj
} = require('../../lib/utils')

module.exports = {

  registerForm(req, res) {

    return res.render('users/register')
  },
  async show(req, res) {

    const {
      user
    } = req

    user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj)
    user.cep = formatCep(user.cep)

    return res.render('users/index', {
      user
    })
  },
  async post(req, res) {
    try {
      const userId = await User.create(req.body)

      req.session.userId = userId

      let newUserAddress = {
        ...req.body,
        user_id: userId
      }

      const address = await User.createAddress(newUserAddress)

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
      }).then(await User.updateAddress(user.id, {
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
      await User.delete(req.body.id)
      req.session.destroy()

      return res.render('session/login', {
        success: 'Conta deletada com sucesso.'
      })
    } catch (err) {
      console.error(err);
      return res.render('users/index', {
        user,
        error: 'Erro ao deletar sua conta.'
      })
    }
  }
}
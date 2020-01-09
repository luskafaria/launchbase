const User = require('../models/User.js')
const {
  compare
} = require('bcryptjs')

function checkAllFields(body) {
  const keys = Object.keys(body);

  for (key of keys) {
    if (body[key] == "" && body[key] != body.complement) {
      return {
        user: body,
        error: 'Preencha todos os campos.'
      }
    }
  }
}

module.exports = {
  async post(req, res, next) {

    let {
      email,
      cpf_cnpj,
      password,
      passwordRepeat,
    } = req.body

    cpf_cnpj = cpf_cnpj.replace(/\D/g, "")

    //check if has all fields
    const fillAllFields = checkAllFields(req.body)
    if (fillAllFields) {
      return res.render('user/regiter', fillAllFields)
    }

    //check if user exists [email, cpf_cnpj]
    const user = await User.findOne({
      where: {
        email
      },
      or: {
        cpf_cnpj
      }
    })
    if (user) return res.render('users/register.njk', {
      user: req.body,
      error: 'Usuário já cadastrado.'
    })

    //check if password match
    if (password !== passwordRepeat) {
      return res.render('users/register.njk', {
        user: body,
        error: 'As senhas são diferentes.'
      })
    }

    next()
  },
  async show(req, res, next) {
    const {
      userId: id
    } = req.session

    const user = await User.findOne({
      where: {
        id
      }
    })

    if (!user) return res.render('users/index', {
      error: 'Usuário não encontrado.'
    })

    req.user = user

    next()
  },
  async update(req, res, next) {
    //check all fields
    const fillAllFields = checkAllFields(req.body)

    if (fillAllFields) {
      return res.render('user/regiter', fillAllFields)
    }

    //password matches
    const {
      id,
      password
    } = req.body

    if (!password) return res.render('users/index', {
      user: req.body,
      error: 'Informe sua senha para atualizar o seu cadastro.'
    })

    
    const user = await User.findOne({
      where: {
        id
      }
    })

    const passed = await compare(password, user.password)

    if (!passed) return res.render('users/index', {
      user: req.body,
      error: 'Senha incorreta.'
    })

    req.user = user

    next()
  }
}
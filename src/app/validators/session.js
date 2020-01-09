const User = require('../models/User.js')
const {
  compare
} = require('bcryptjs')

module.exports = {

  async login(req, res, next) {
    const {
      email,
      password
    } = req.body

    let user = await User.findOne({
      where: {
        email
      }
    })

    if (!user) return res.render('session/login', {
      user: req.body,
      error: 'Usuário não cadastrado.'
    })

    const passed = await compare(password, user.password)

    if (!passed) return res.render('session/login', {
      user: req.body,
      error: 'Senha incorreta.'
    })

    req.user = user

    next()

  },
  async forgot(req, res, next) {

    const {
      email
    } = req.body

    try {
      let user = await User.findOne({
        where: {
          email
        }
      })

      if (!user) return res.render('session/forgot-password', {
        user: req.body,
        error: 'Email não cadastrado.'
      })

      req.user = user

      next()
    } catch (err) {
      console.error(err);

    }
  },
  async reset(req, res, next) {

    //procurar usuario
    const {
      email,
      password,
      passwordRepeat,
      token
    } = req.body

    const user = await User.findOne({
      where: {
        email
      }
    })

    if (!user) return res.render('session/password-reset.njk', {
      user: req.body,
      token,
      error: 'Usuário não cadastrado.'
    })

    //ver se a senha bate
    if (password !== passwordRepeat) {
      return res.render('session/password-reset.njk', {
        user: req.body,
        token,
        error: 'As senhas são diferentes.'
      })
    }

    //verificar se o token bate
    if (token != user.reset_token) {
      return res.render('users/password-reset.njk', {
        user: body,
        token,
        error: 'Token inválido. Solicite uma nova recuperação de senha.'
      })
    }
    //verificar se o token não expirou
    let now = new Date()
    now = now.setHours(now.getHours())

    if (now > user.reset_token_expires) {
      return res.render('users/password-reset.njk', {
        user: body,
        token,
        error: 'Token expirado. Solicite uma nova recuperação de senha.'
      })
    }

    req.user = user

    next()
  }
}
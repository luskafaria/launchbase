const crypto = require('crypto')
const mailer = require('../../lib/mailer')
const {
  hash
} = require('bcryptjs')
const User = require('../models/User')

module.exports = {

  login(req, res) {
    req.session.userId = req.user.id

    return res.redirect('/users')
  },
  loginForm(req, res) {
    return res.render("session/login")
  },
  logout(req, res) {
    req.session.destroy()

    return res.redirect('/')
  },
  forgotForm(req, res) {
    return res.render('session/forgot-password.njk')
  },
  async forgot(req, res) {

    try {
      const user = req.user

      //user token

      const token = crypto.randomBytes(20).toString('hex')

      //create a token duration

      let now = new Date()
      now = now.setHours(now.getHours() + 1)

      await User.update(user.id, {
        reset_token: token,
        reset_token_expires: now
      })

      //send a link to password change
      await mailer.sendMail({
        to: user.email,
        from: 'no-reply@launchstore.com.br',
        subject: 'Recuperação de senha',
        html: `
            <h2>Perdeu as chaves?</h2>
        <p>Não se preocupe, clique no link abaixo para recuperar sua senha.</p>
        <p>
          <a href='http://localhost:3000/users/password-reset?token=${token}' target='_blank'>
            RECUPERAR SENHA
          </a>
        </p>

      `
      })
      //notify user

      return res.render('session/forgot-password', {
        success: 'Verifique seu email para resertar sua senha!'
      })
    } catch (err) {
      console.error(err);
      return res.render('session/forgot-password', {
        error: 'Ocorreu algum erro.'
      })
    }
  },
  async resetForm(req, res) {
    return res.render('session/password-reset.njk', {
      token: req.query.token
    })
  },
  async reset(req, res) {

    const user = req.user

    const {
      password,
      token
    } = req.body

    try {

      //novo hash de senha
      const newPassword = await hash(password, 8)

      //atualiza o usuário
      await User.update(user.id, {
        password: newPassword,
        reset_token: '',
        reset_token_expires: '',

      })
      //avisa o usuário que a senha foi redefinida
      return res.render('session/login', {
        user: req.body,
        success: 'Senha atualizada com sucesso! Faça seu login.'
      })

    } catch (err) {
      console.error(err);
      return res.render('session/forgot-password', {
        user: req.body,
        token,
        error: 'Ocorreu algum erro.'
      })
    }
  }
}
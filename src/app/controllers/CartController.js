const Cart = require('../../lib/cart')
const LoadProductsService = require('../services/LoadProductService')

module.exports = {
  async index(req, res) {
    try {

      let {
        cart
      } = req.session

      //gerenciardor de carrinho
      cart = Cart.init(cart)

      return res.render('cart/index', {
        cart
      })
    } catch (err) {
      console.error(err);
    }
  },
  async addOne(req, res) {
    //pegar o id do produto
    const {
      id
    } = req.params

    const product = await LoadProductsService.load('product', {
      where: {
        id
      }
    })
    //pegar o carrinho da sessao
    let {
      cart
    } = req.session
    //adicionar o produto ao carrinho (usando o gerenciador de carrinho)
    cart = Cart.init(cart).addOne(product)
    //atualizar o carrinho da sessao
    req.session.cart = cart
    //redirecionar o usuário para a tela do carrinho
    return res.redirect('/cart')
  },
  removeOne(req, res) {

    //pegar o id do produto
    let {
      id
    } = req.params
    //pegar o carrinho da sessao
    let {
      cart
    } = req.session
    //se não tiver carrinho - retornar
    if (!cart) return res.redirect('/cart')
    //iniciar o carrinho (gerenciador de carrinho)
    cart = Cart.init(cart).removeOne(id)
    //atualizar o carrinho da sessao removendo um item
    req.session.cart = cart
    //redirecionar para a página cart
    return res.redirect('/cart')
  },
  delete(req, res) {
    let {
      cart
    } = req.session
    let {
      id
    } = req.params

    if (!cart) return

    req.session.cart = Cart.init(cart).delete(id)

     return res.redirect("/cart")
  }
}
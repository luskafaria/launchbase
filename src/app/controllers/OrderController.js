const LoadProductService = require('../services/LoadProductService')
const LoadOrderService = require('../services/LoadOrderService')
const User = require('../models/User')
const Order = require('../models/Order')

const Cart = require('../../lib/cart')
const mailer = require('../../lib/mailer')
const {
  formatPrice,
  date
} = require('../../lib/utils')


const email = (seller, product, buyer) => `
<h2>Olá ${seller.name}.</h2>
<p>Você tem um novo pedido de compra do seu produto.</p>
<p>Produto: ${product.name}</p>
<p>Preço: ${product.formattedPrice}</p>
<p></br></br></p>
<h3>Dados do comprador</h3>
<p>Nome: ${buyer.name}</p>
<p>Email: ${buyer.email}</p>
<p></br></br></p>
<p><strong>Entre em contato com o comprador para finalizar a venda</strong></p>
`


module.exports = {
  async index(req, res) {
    //pegar pedidos do usuário
    const orders = await LoadOrderService.load('orders', {
      where: {
        buyer_id: req.session.userId
      }
    })

    return res.render("orders/index", {
      orders
    })
  },
  async sales(req, res) {
    //pegar pedidos do usuário
    const sales = await LoadOrderService.load('orders', {
      where: {
        seller_id: req.session.userId
      }
    })

    return res.render("orders/sales", {
      sales
    })
  },
  async post(req, res) {

    try {
      // pegar todos os produtos do carrinho
      const cart = Cart.init(req.session.cart)

      const buyer_id = req.session.userId
      const filteredItems = cart.items.filter(item =>
        item.product.user_id != buyer_id
      )

      //criar o pedido
      const createOrdersPromise = filteredItems.map(async item => {
        let {
          product,
          price: total,
          quantity
        } = item
        const {
          price,
          id: product_id,
          user_id: seller_id
        } = product
        const status = 'open'

        const order = await Order.create({
          seller_id,
          buyer_id,
          product_id,
          price,
          total,
          quantity,
          status
        })

        // pegar os dados do produto
        product = await LoadProductService.load('product', {
          where: {
            id: product.id
          }
        })

        // os dados do vendedor
        const seller = await User.findOne({
          where: {
            id: seller_id
          }
        })
        // os dados do comprador
        const buyer = await User.findOne({
          where: {
            id: buyer_id
          }
        })
        // enviar email com dados da compra para o vendedor
        await mailer.sendMail({
          to: seller.email,
          from: 'no-replay@launchstore.com.br',
          subject: 'Novo pedido de compra',
          html: email(seller, product, buyer)
        })

        return order
      })

      await Promise.all(createOrdersPromise)

      // CLEAN CART

      delete req.session.cart
      Cart.init()

      // notificar o usuário com alguma mensagem de sucesso
      return res.render('orders/success')
    } catch (err) {
      console.error(err);
      return res.render('orders/error')
    }
  },
  async show(req, res) {
    const order = await LoadOrderService.load('order', {
    where: {id: req.params.id}
    })

    return res.render('orders/details', {
      order
    })
  }
}
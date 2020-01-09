const {
  formatPrice
} = require('./utils')

// carrinho guardado na sessao (req.session)
const Cart = {
  init(oldCart) {
    if (oldCart) {
      this.items = oldCart.items
      this.total = oldCart.total
    } else {
      this.items = []
      this.total = {
        quantity: 0,
        price: 0,
        formattedPrice: formatPrice(0)
      }
    }

    return this
  },
  addOne(product) {
    //ver se o produto já está no carrinho
    let inCart = this.items.find(item => item.product.id == product.id)

    //se não existe
    if(!inCart) {
      inCart = {
        product: {
          ...product,
          formattedPrice: formatPrice(product.price)
        },
        quantity: 0,
        formattedPrice: formatPrice(0)
      }   
      
      this.items.push(inCart)
    }
    //max quantity
    if(inCart.quantity >= product.quantity) return this
    //update item
    inCart.quantity++
    inCart.price = inCart.product.price * inCart.quantity
    inCart.formattedPrice = formatPrice(inCart.price)
    //update cart
    this.total.quantity++
    this.total.price += inCart.product.price
    this.total.formattedPrice = formatPrice(this.total.price)

    return this
  },
  removeOne(productId) {},
  delete(productId) {}
}

const product = {
  id: 1,
  price: 1.99,
  quantity: 2
}

module.exports = Cart
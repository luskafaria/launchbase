const db = require('../../config/db');
const {
  hash
} = require('bcryptjs');
const fs = require('fs')
const Product = require('../models/Product')

module.exports = {
  async findOne(filters) {
    try {

      let query = `SELECT users.*,
        address.user_id,
        address.cep,        
        address.street,
        address.street_number,
        address.complement,
        address.neighborhood,
        address.city,
        address.state,
        address.status
        FROM users`

      query = `
      ${query}
      LEFT JOIN address ON (users.id = address.user_id)
    `
      Object.keys(filters).map(key => {
        // WHERE | OR | AND
        query = `${query}
        ${key}
      `
        Object.keys(filters[key]).map(field => {
          // email | cpf_cnpj
          query = `${query} users.${field} = '${filters[key][field]}'`

        })
      })

      const results = await db.query(query)

      return results.rows[0]
    } catch (err) {
      console.error(err);
    }
  },
  async create(data) {
    try {
      const query = `
      INSERT INTO users (
        name,
        email,        
        password,
        cpf_cnpj
        ) VALUES ($1, $2, $3, $4)
      RETURNING id
    `

      const passwordHash = await hash(data.password, 8)


      const values = [
        data.name,
        data.email,
        passwordHash,
        data.cpf_cnpj.replace(/\D/g, ""),
      ]

      const results = await db.query(query, values)

      return results.rows[0].id
    } catch (err) {
      console.error(err);
    }
  },
  async createAddress(data) {
    try {
      const query = `
      INSERT INTO address (
      user_id,
      cep,        
      street,
      street_number,
      complement,
      neighborhood,
      city,
      state,
      status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `

      const values = [
        data.user_id,
        data.cep,
        data.street,
        data.street_number,
        data.complement,
        data.neighborhood,
        data.city,
        data.state,
        data.status || 1
      ]

      const results = await db.query(query, values)
      return results.rows[0]
    } catch (err) {
      console.error(err);

    }
  },
  async update(id, fields) {
    let query = "UPDATE users SET"

    Object.keys(fields).map((key, index, array) => {
      if (index + 1 < array.length) {
        query = `
          ${query}
          ${key} = '${fields[key]}',
        `
      } else {
        //last iteration
        query = `
          ${query}
          ${key} = '${fields[key]}'
          WHERE id = ${id}
        `
      }
    })

    await db.query(query)
    return
  },
  async updateAddress(id, fields) {
    try {
      let query = "UPDATE address SET"

      Object.keys(fields).map((key, index, array) => {
        if (index + 1 < array.length) {
          query = `
          ${query}
          ${key} = '${fields[key]}',
        `
        } else {
          //last iteration
          query = `
          ${query}
          ${key} = '${fields[key]}'
          WHERE user_id = ${id}
        `
        }
      })

      await db.query(query)
      return
    } catch (err) {
      console.error(err);

    }
  },
  async delete(id) {
    try {
      //pegar todos os produtos
      let results = await db.query("SELECT * FROM products WHERE user_id = $1", [id])
      const products = results.rows

      //pegar todas as imagens
      const allFilesPromise = products.map(product =>
        Product.files(product.id))

      let promiseResults = await Promise.all(allFilesPromise)

      //rodar a remoção do usuário
      await db.query('DELETE FROM users WHERE id = $1', [id])

      //remover as imagens da pasta public
      promiseResults.map(results => {
        results.rows.map(file => {
          try {
            fs.unlinkSync(file.path)
          } catch (err) {
            console.error(err);
          }
        })
      })
    } catch (err) {
      console.error(err);
    }

  }
}
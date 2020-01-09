
const Base = require('./Base')

Base.init({
  table: 'users'
})

module.exports = {
  ...Base,
  // async findOne(filters) {
  //   try {

  //     let query = `SELECT users.*,
  //     address.user_id,
  //     address.cep,        
  //     address.street,
  //     address.street_number,
  //     address.complement,
  //     address.neighborhood,
  //     address.city,
  //     address.state,
  //     address.status
  //     FROM users`

  //     query = `
  //     ${query}
  //     LEFT JOIN address ON (users.id = address.user_id)
  //   `
  //     Object.keys(filters).map(key => {
  //       // WHERE | OR | AND
  //       query = `${query}
  //       ${key}
  //     `
  //       Object.keys(filters[key]).map(field => {
  //         // email | cpf_cnpj
  //         query = `${query} users.${field} = '${filters[key][field]}'`

  //       })
  //     })

  //     const results = await db.query(query)

  //     return results.rows[0]
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }
}
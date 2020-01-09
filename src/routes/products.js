const express = require('express');
const routes = express.Router();
const multer = require('../app/middlewares/multer.js');

const ProductController = require('../app/controllers/ProductController');
const SearchController = require('../app/controllers/SearchController');

const Validator = require('../app/validators/product')

const {
  onlyUsers
} = require('../app/middlewares/session')

// Search
routes.get('/search', SearchController.index)

// Products
routes.get('/create', onlyUsers, ProductController.create);
routes.get('/:id', ProductController.show);
routes.get('/:id/edit', onlyUsers, ProductController.edit);

routes.post('/', onlyUsers, multer.array("images", 6), Validator.post, ProductController.post);
routes.put('/', onlyUsers, multer.array("images", 6), Validator.put, ProductController.put);
routes.delete('/', onlyUsers, ProductController.delete);

module.exports = routes;
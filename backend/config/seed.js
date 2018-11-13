'use strict'
const _ = require('lodash');

const Thing = require('../api/thing/thing.model');
const User = require('../api/user/user.model');
const Product = require('../api/product/product.model').product;
const Variant = require('../api/product/product.model').variant;
const Review = require('../api/product/product.model').review;
const Image = require('../api/product/product.model').image;
const Catalog = require('../api/catalog/catalog.model');

const users = require('../data/users.json');
const catalogs = require('../data/catalogs.json');
const variants = require('../data/variants.json');
const images = require('../data/images.json');
const reviews = require('../data/reviews.json');
const products = require('../data/products.json');


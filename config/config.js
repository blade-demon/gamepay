const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'gamepay'
    },
    port: process.env.PORT || 8080,
    db: 'mongodb://localhost/gamepay-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'gamepay'
    },
    port: process.env.PORT || 8080,
    db: 'mongodb://localhost/gamepay-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'gamepay'
    },
    port: process.env.PORT || 8080,
    db: 'mongodb://localhost/gamepay-production'
  }
};

module.exports = config[env];

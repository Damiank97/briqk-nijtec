// Vercel Node.js function. No PHP and no secrets in the static website.
module.exports = require('../server/contact.cjs').createHandler();

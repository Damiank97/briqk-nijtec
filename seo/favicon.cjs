const {color} = require('../NIJTEC-DESIGN-TOKENS.json');

// Put the byte-identical transparent brand artwork on opaque paper. Do not
// crop, trace, recolour or use the old black-backed bitmap as a tab icon.
module.exports = logo => '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">'
  + '<rect width="64" height="64" fill="'+color.paperLight+'"/>'
  + '<image x="2" y="2" width="60" height="60" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,'+logo.toString('base64')+'"/>'
  + '</svg>\n';

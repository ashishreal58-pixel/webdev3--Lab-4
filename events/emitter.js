const { EventEmitter } = require('events');

// Shared application-wide EventEmitter instance
const appEmitter = new EventEmitter();

module.exports = appEmitter;

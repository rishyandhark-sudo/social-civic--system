const { EventEmitter } = require('events');

/**
 * complaint.service.js emits on this bus after every successful status
 * transition; sockets/index.js listens and pushes to connected clients.
 * Keeping this as a plain EventEmitter (rather than importing socket.io
 * directly into complaint.service.js) means the service layer has no
 * knowledge of HTTP/websockets at all — it stays testable in isolation.
 */
const eventBus = new EventEmitter();

module.exports = eventBus;

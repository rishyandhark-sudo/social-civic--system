const { Server } = require('socket.io');
const eventBus = require('../utils/eventBus');

/**
 * Room convention:
 *   citizen:<userId>    — a citizen joins this to get updates on all their
 *                          own complaints (tracking dashboard)
 *   complaint:<id>      — anyone viewing a specific complaint's detail page
 *                          joins this for that complaint only
 * The client emits 'join' with one of these room names after connecting.
 */
function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*' }, // tighten this to your actual frontend origin(s) before production
  });

  io.on('connection', (socket) => {
    socket.on('join', (room) => socket.join(room));
    socket.on('leave', (room) => socket.leave(room));
  });

  eventBus.on('complaint:statusChanged', (payload) => {
    io.to(`complaint:${payload.complaintId}`).emit('complaint:statusChanged', payload);
    io.to(`citizen:${payload.citizenId}`).emit('complaint:statusChanged', payload);
  });

  return io;
}

module.exports = initSocket;

import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io('/', { autoConnect: true });
  }
  return socket;
}

// Joins a room to receive live complaint status updates.
// room is either `citizen:<userId>` or `complaint:<complaintId>` —
// see server/src/sockets/index.js for the room convention.
export function joinRoom(room) {
  getSocket().emit('join', room);
}

export function onStatusChanged(callback) {
  getSocket().on('complaint:statusChanged', callback);
  return () => getSocket().off('complaint:statusChanged', callback);
}

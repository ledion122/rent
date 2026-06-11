const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (token) {
      const userId = getUserIdFromToken(token);
      if (userId) {
        socket.userId = userId;
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined room user:${userId}`);
      }
    }

    socket.on('join-vehicle', (vehicleId) => {
      socket.join(`vehicle:${vehicleId}`);
    });

    socket.on('leave-vehicle', (vehicleId) => {
      socket.leave(`vehicle:${vehicleId}`);
    });

    socket.on('bookingUpdate', (data) => {
      const { bookingId, status, userId } = data;
      if (userId) {
        io.to(`user:${userId}`).emit('bookingUpdated', { bookingId, status });
      }
    });

    socket.on('join-booking', (bookingId) => {
      socket.join(`booking:${bookingId}`);
    });

    socket.on('leave-booking', (bookingId) => {
      socket.leave(`booking:${bookingId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

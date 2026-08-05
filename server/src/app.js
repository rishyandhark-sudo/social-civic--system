require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const initSocket = require('./sockets');
const citizenRoutes = require('./modules/citizen/citizen.routes');
const complaintRoutes = require('./modules/complaints/complaint.routes');
const categoryRoutes = require('./modules/complaints/category.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const workerRoutes = require('./modules/worker/worker.routes');

const app = express();
const httpServer = http.createServer(app);

connectDB();
initSocket(httpServer);

app.use(cors());
app.use(express.json());

// Serves locally-uploaded complaint media during dev.
// Remove this once media uploads go straight to Cloudinary/S3.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/citizen', citizenRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/worker', workerRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

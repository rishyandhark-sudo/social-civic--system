app.use((req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/socket.io')) {
    return next();
  }
  next();
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (req, res) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/socket.io') || req.url.startsWith('/uploads')) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
  });
} else {
  app.use((req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/socket.io') || req.url.startsWith('/uploads')) {
      return next();
    }
    res.status(404).json({ message: 'Route not found' });
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

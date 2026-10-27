import app from './src/app.js';
import connectDB from './src/config/db.js';
import env from './src/config/env.js';

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const PORT = env.PORT;
  app.listen(PORT, () => {
    console.log(`\n🏨  HotelPro server running in ${env.NODE_ENV} mode on port ${PORT}\n`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

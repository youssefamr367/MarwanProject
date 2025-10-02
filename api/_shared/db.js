import mongoose from 'mongoose';

let connected = false;

export async function ensureConnection() {
  if (connected && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI not set');
  }
  // Slightly longer timeout for serverless cold starts
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  connected = true;
}

export default mongoose;

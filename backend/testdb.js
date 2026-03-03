import 'dotenv/config';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

async function test() {
  try {
    await connectDB();
    console.log('Mongo connection works');
    // list databases directly via native driver
    try {
      const admin = mongoose.connection.db.admin();
      const { databases } = await admin.listDatabases();
      console.log('Databases:');
      databases.forEach(db => console.log(' -', db.name));
    } catch (listErr) {
      console.error('Failed to list databases:', listErr.message);
    }
  } catch (err) {
    console.error('Mongo connection failed', err.message);
  } finally {
    process.exit(0);
  }
}

test();
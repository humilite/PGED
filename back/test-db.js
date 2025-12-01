import { connectDB } from './src/config/database.js';
import { User } from './src/models/index.js';

async function testDB() {
  try {
    console.log('Testing database connection...');
    const connected = await connectDB();
    console.log('DB connected:', connected);

    if (connected) {
      console.log('Testing user lookup...');
      const user = await User.findById(1);
      console.log('User found:', user ? { id: user.id, email: user.email } : 'null');
    }
  } catch (error) {
    console.error('DB test error:', error.message);
  }
}

testDB();

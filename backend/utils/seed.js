console.log("1. Script has started...");
require('dotenv').config();
console.log("2. Dotenv loaded...");
require('dotenv').config(); // Add this so 'npm run seed' works!
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');

const users = [
  { name: 'Admin User', email: 'admin@shopease.com', password: 'admin123', role: 'admin' },
  { name: 'Jane Doe', email: 'jane@example.com', password: 'user1234', role: 'user' },
];

const products = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation...',
    price: 8999, discountPrice: 6499, brand: 'SoundCore', category: 'electronics',
    stockQty: 45, avgRating: 4.5, reviewCount: 128, isFeatured: true,
    images: [{ url: 'https://placehold.co/600x400/1e40af/white?text=Headphones', isPrimary: true }],
  },
  // ... (the rest of your product objects)
];

const seedDatabase = async () => {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB...");

    // 1. CLEAR EXISTING DATA (Prevents duplicates)
    await User.deleteMany();
    await Product.deleteMany();
    console.log("🗑️  Old data cleared.");

    // 2. HASH PASSWORDS (Crucial: otherwise users can't log in!)
    const salt = await bcrypt.genSalt(10);
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        user.password = await bcrypt.hash(user.password, salt);
        return user;
      })
    );

    // 3. INSERT NEW DATA
    await User.insertMany(hashedUsers);
    await Product.insertMany(products);

    console.log("🌱 Data Seeded Successfully!");
    
    await mongoose.connection.close();
    console.log("🔌 Connection closed.");
    process.exit(0); 

  } catch (error) {
    console.error("❌ Error during seeding:", error.message);
    process.exit(1);
  }
};

seedDatabase();
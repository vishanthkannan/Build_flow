const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const seedData = async () => {
    try {
        await User.deleteMany();

        const manager = await User.create({
            username: 'admin',
            password: 'password123',
            role: 'manager'
        });

        const supervisor = await User.create({
            username: 'sup1',
            password: 'password123',
            role: 'supervisor'
        });

        console.log('Users Seeded');
        console.log('Manager: admin / password123');
        console.log('Supervisor: sup1 / password123');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();

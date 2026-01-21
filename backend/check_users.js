const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const users = await User.find({});
        console.log('Users found:', users.length);
        fs.writeFileSync('users_dump.txt', JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}).catch(e => {
    console.error(e);
    process.exit(1);
});

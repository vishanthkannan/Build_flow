const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

console.log('Connecting to', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected');
        try {
            await User.deleteMany({});
            console.log('Deleted users');

            const manager = new User({
                username: 'admin',
                password: '123',
                role: 'manager'
            });
            await manager.save();
            console.log('Manager created');

            const supervisor = new User({
                username: 'e1',
                password: '123',
                role: 'supervisor'
            });
            await supervisor.save();
            console.log('Supervisor created');

            process.exit(0);
        } catch (e) {
            console.error('ERROR:', e);
            fs.writeFileSync('seed_error.txt', e.toString() + '\n' + e.stack);
            process.exit(1);
        }
    }).catch(e => {
        console.error('Connect Error:', e);
        fs.writeFileSync('seed_error.txt', 'Connect Error: ' + e.toString());
        process.exit(1);
    });

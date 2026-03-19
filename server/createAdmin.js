require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const exists = await User.findOne({ email: 'owner@jobtrack.com' });
        if (!exists) {
            await User.create({
                username: 'ownerAdmin',
                email: 'owner@jobtrack.com',
                password: 'admin123#Secure',
                role: 'Admin'
            });
            console.log('Admin owner created successfully.');
        } else {
            console.log('Admin owner already exists.');
        }
    } catch (err) {
        console.error('Error creating admin owner: ', err);
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();

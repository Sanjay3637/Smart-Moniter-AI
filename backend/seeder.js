import mongoose from 'mongoose';
import dotenv from 'dotenv';
import users from './data/users.js';
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();

console.log('MONGO_URL:', process.env.MONGO_URL);

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();

        console.log('Data Destroyed... FAST AND CLEAN');

        // We use a loop and save() to ensure the pre-save hook in userModel.js runs to hash the password
        for (const user of users) {
            const createdUser = new User(user);
            await createdUser.save();
        }

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}

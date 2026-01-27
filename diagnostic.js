import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/userModel.js';
import dns from 'dns';
import fs from 'fs';

dotenv.config();

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('diagnostic.log', msg + '\n');
};

if (fs.existsSync('diagnostic.log')) fs.unlinkSync('diagnostic.log');

const diagnostic = async () => {
    log('--- Environment Check ---');
    log(`EMAIL_USER: ${process.env.EMAIL_USER ? 'Defined' : 'Missing'}`);
    log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? 'Defined' : 'Missing'}`);
    log(`MONGO_URL: ${process.env.MONGO_URL ? 'Defined' : 'Missing'}`);

    log('\n--- DNS Check ---');
    dns.lookup('smtp.gmail.com', (err, address, family) => {
        if (err) log(`DNS Lookup failed for smtp.gmail.com: ${err.message}`);
        else log(`DNS Lookup for smtp.gmail.com: ${address} (IPv${family})`);
    });

    log('\n--- Database Check ---');
    try {
        await mongoose.connect(process.env.MONGO_URL);
        log('Connected to MongoDB');

        const rollNumber = '714022104130';
        const user = await User.findOne({ rollNumber });
        if (user) {
            log(`User found: ${user.name}`);
            log(`Email associated: ${user.email || 'NONE'}`);
        } else {
            log(`User with rollNumber ${rollNumber} not found.`);
        }

    } catch (err) {
        log(`Database connection error: ${err.message}`);
    } finally {
        setTimeout(() => {
            mongoose.disconnect();
            log('\nDiagnostic Complete.');
        }, 3000);
    }
};

diagnostic();

import bcrypt from 'bcryptjs';

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: '123',
        role: 'admin',
        isBlocked: false,
        malpracticeCount: 0,
    },
    {
        name: 'Professor Smith',
        email: 'teacher@example.com',
        password: '123',
        role: 'teacher',
        isBlocked: false,
        malpracticeCount: 0,
    },
    {
        name: 'Student One',
        email: 'student@example.com',
        rollNumber: '101',
        password: '123',
        role: 'student',
        isBlocked: false,
        malpracticeCount: 0,
    },
];

export default users;

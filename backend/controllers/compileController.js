
import axios from 'axios';
import asyncHandler from 'express-async-handler';

// @desc    Compile and execute code
// @route   POST /api/compile
// @access  Private
export const compileCode = asyncHandler(async (req, res) => {
    const { language, code, input } = req.body;

    if (!code) {
        res.status(400);
        throw new Error('No code provided');
    }

    // Map frontend languages to Piston API configuration
    let pistonConfig = {};
    switch (language.toLowerCase()) {
        case 'python':
            pistonConfig = { language: 'python', version: '3.10.0' };
            break;
        case 'javascript':
            pistonConfig = { language: 'javascript', version: '18.15.0' };
            break;
        case 'java':
            pistonConfig = { language: 'java', version: '15.0.2' };
            break;
        default:
            res.status(400);
            throw new Error('Unsupported language');
    }

    try {
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
            language: pistonConfig.language,
            version: pistonConfig.version,
            files: [
                {
                    content: code,
                },
            ],
            stdin: input || '',
        });

        res.json(response.data);
    } catch (error) {
        console.error('Compilation Error:', error.message);
        res.status(500);
        throw new Error('Compilation failed: ' + (error.response?.data?.message || error.message));
    }
});

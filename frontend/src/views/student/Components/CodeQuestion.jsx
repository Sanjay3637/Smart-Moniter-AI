import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    Button,
    Select,
    MenuItem,
    CircularProgress,
    Chip,
    Paper,
    Divider,
    Alert,
} from '@mui/material';
import Editor from '@monaco-editor/react';
import { useCompileCodeMutation } from 'src/slices/examApiSlice';
import { toast } from 'react-toastify';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';

export default function CodeQuestion({
    questions,
    saveUserTestScore,
    saveStudentAnswer,
    submitTest,
    currentQuestion = 0,
    setCurrentQuestion,
    onAnswered,
    onSelectionChange,
}) {
    const q = questions[currentQuestion];
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [testResults, setTestResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [editorTheme, setEditorTheme] = useState('vs-dark');

    const [compileCode] = useCompileCodeMutation();
    const [isLastQuestion, setIsLastQuestion] = useState(false);

    // Language-specific starter templates
    const getLanguageDefaults = (lang) => {
        const templates = {
            python: `# Python Solution
def solution():
    # Write your code here
    pass

# Call your function
solution()
`,
            javascript: `// JavaScript Solution
function solution() {
    // Write your code here
}

// Call your function
solution();
`,
            java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your Java code here
        
        sc.close();
    }
}
`,
        };
        return templates[lang] || '';
    };

    useEffect(() => {
        if (questions && questions.length > 0) {
            setIsLastQuestion(currentQuestion === questions.length - 1);
        }
        // Reset state on question change
        const defaultCode = getLanguageDefaults('python');
        setCode(defaultCode);
        setLanguage('python');
        setOutput('');
        setTestResults([]);
    }, [currentQuestion, questions]);

    const handleCodeChange = (value) => {
        setCode(value || '');
        // Save the answer with both code and language
        const answerData = { code: value || '', language };
        if (saveStudentAnswer) saveStudentAnswer(q._id, answerData);
    };

    const handleLanguageChange = (event) => {
        const newLang = event.target.value;
        setLanguage(newLang);
        const template = getLanguageDefaults(newLang);
        setCode(template);
        // Save the answer with both code and new language
        const answerData = { code: template, language: newLang };
        if (saveStudentAnswer) saveStudentAnswer(q._id, answerData);
    };

    const executeCode = async () => {
        if (!code.trim()) {
            toast.error('Please write some code.');
            return;
        }
        setIsRunning(true);
        setTestResults([]);
        setOutput('⏳ Running test cases...');

        const testCases = q.codeQuestion?.testCases || [];
        const results = [];
        let allPassed = true;

        try {
            for (let i = 0; i < testCases.length; i++) {
                const tc = testCases[i];
                const res = await compileCode({ language, code, input: tc.input }).unwrap();

                const runOutput = res.run.stdout?.trim() || res.run.stderr?.trim() || '';
                const passed = runOutput === tc.output?.trim();

                if (!passed) allPassed = false;

                results.push({
                    input: tc.input,
                    expected: tc.output,
                    actual: runOutput,
                    passed,
                    isHidden: tc.isHidden,
                });
            }

            setTestResults(results);
            const passedCount = results.filter(r => r.passed).length;
            setOutput(`✅ ${passedCount}/${results.length} test cases passed`);
        } catch (err) {
            setOutput('❌ Error: ' + (err?.data?.message || err.message));
            allPassed = false;
        } finally {
            setIsRunning(false);
        }
    };

    const handleNext = () => {
        const passed = testResults.length > 0 && testResults.every((r) => r.passed);

        if (saveStudentAnswer) {
            const answerData = { code, language, isCorrect: passed };
            saveStudentAnswer(q._id, answerData);
        }

        let status = 'attended';
        if (testResults.length > 0) {
            const passedCount = testResults.filter(r => r.passed).length;
            const totalCount = testResults.length;

            // Check for errors/failures
            const hasError = testResults.some(r => !r.passed);

            if (passed === true) {
                status = 'correct'; // Full correct (Green)
            } else if (passedCount > 0 && passedCount < totalCount) {
                status = 'partial'; // Partially correct (Yellow)
            } else {
                status = 'error'; // Error in code/All Failed (Red)
            }
        }

        if (onAnswered) onAnswered(currentQuestion, status);
        if (passed) saveUserTestScore();

        if (currentQuestion < questions.length - 1 && setCurrentQuestion) {
            setCurrentQuestion(currentQuestion + 1);
        } else if (submitTest) {
            submitTest();
        }
    };

    const allTestsPassed = testResults.length > 0 && testResults.every((r) => r.passed);

    // Get visible (example) test cases for display
    const exampleTestCases = (q.codeQuestion?.testCases || []).filter(tc => !tc.isHidden).slice(0, 2);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Question Header */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                    <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Question {currentQuestion + 1}: Programming Challenge
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', lineHeight: 1.7 }}>
                    {q.question}
                </Typography>
            </Paper>

            {/* Problem Specification */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Stack spacing={2}>
                    {/* Input Format */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#667eea', mb: 1 }}>
                            <InputIcon sx={{ fontSize: 20, mr: 0.5, verticalAlign: 'middle' }} />
                            Input Format
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                {q.codeQuestion?.inputFormat || 'Not specified'}
                            </Typography>
                        </Paper>
                    </Box>

                    {/* Output Format */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#764ba2', mb: 1 }}>
                            <OutputIcon sx={{ fontSize: 20, mr: 0.5, verticalAlign: 'middle' }} />
                            Output Format
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                {q.codeQuestion?.outputFormat || 'Not specified'}
                            </Typography>
                        </Paper>
                    </Box>

                    {/* Constraints */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#4caf50', mb: 1 }}>
                            ⚖️ Constraints
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                            <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace' }}>
                                {(q.codeQuestion?.constraints || 'Not specified').split('\n').map((line, i) => (
                                    <Box key={i} sx={{ mb: 0.5 }}>• {line.trim()}</Box>
                                ))}
                            </Typography>
                        </Paper>
                    </Box>

                    {/* Example Test Cases */}
                    {exampleTestCases.length > 0 && (
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#ff6b6b', mb: 1 }}>
                                📝 Example Test Cases
                            </Typography>
                            <Stack spacing={1.5}>
                                {exampleTestCases.map((tc, idx) => (
                                    <Paper key={idx} sx={{ p: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#667eea' }}>
                                            Example {idx + 1}
                                        </Typography>
                                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 1 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                                                    Input:
                                                </Typography>
                                                <Paper sx={{ p: 1, bgcolor: 'white', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                    {tc.input || '(empty)'}
                                                </Paper>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                                                    Output:
                                                </Typography>
                                                <Paper sx={{ p: 1, bgcolor: 'white', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                    {tc.output || '(empty)'}
                                                </Paper>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </Paper>

            {/* Editor Controls */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 1 }}>
                <Select
                    size="small"
                    value={language}
                    onChange={handleLanguageChange}
                    sx={{
                        minWidth: 160,
                        bgcolor: 'white',
                        fontWeight: 600,
                        '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 },
                    }}
                >
                    <MenuItem value="python">
                        <Box component="span" sx={{ fontSize: '1.2rem' }}>🐍</Box> Python
                    </MenuItem>
                    <MenuItem value="javascript">
                        <Box component="span" sx={{ fontSize: '1.2rem' }}>⚡</Box> JavaScript
                    </MenuItem>
                    <MenuItem value="java">
                        <Box component="span" sx={{ fontSize: '1.2rem' }}>☕</Box> Java
                    </MenuItem>
                </Select>

                <Button
                    variant="contained"
                    size="large"
                    startIcon={isRunning ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
                    onClick={executeCode}
                    disabled={isRunning}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #653a8a 100%)' },
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                    }}
                >
                    {isRunning ? 'Running...' : 'Run Code'}
                </Button>

                <Select
                    size="small"
                    value={editorTheme}
                    onChange={(e) => setEditorTheme(e.target.value)}
                    sx={{ minWidth: 140 }}
                >
                    <MenuItem value="vs-dark">🌙 Dark Theme</MenuItem>
                    <MenuItem value="light">☀️ Light Theme</MenuItem>
                    <MenuItem value="hc-black">🔲 High Contrast</MenuItem>
                </Select>

                <Box sx={{ flex: 1 }} />

                {allTestsPassed && (
                    <Chip
                        icon={<CheckCircleIcon />}
                        label="All Tests Passed!"
                        color="success"
                        sx={{ fontWeight: 700, fontSize: '0.9rem', px: 1 }}
                    />
                )}
            </Stack>

            {/* Monaco Code Editor */}
            <Paper
                elevation={4}
                sx={{
                    height: 500,
                    overflow: 'hidden',
                    borderRadius: 2,
                    border: '2px solid #e0e0e0',
                }}
            >
                <Editor
                    height="500px"
                    language={language}
                    value={code}
                    onChange={handleCodeChange}
                    theme={editorTheme}
                    loading={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 500 }}><CircularProgress /></Box>}
                    options={{
                        minimap: { enabled: true, maxColumn: 50 },
                        fontSize: 15,
                        fontFamily: "'Fira Code', 'Courier New', monospace",
                        fontLigatures: true,
                        lineNumbers: 'on',
                        roundedSelection: true,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: language === 'python' ? 4 : 2,
                        insertSpaces: true,
                        wordWrap: 'on',
                        bracketPairColorization: { enabled: true },
                        autoClosingBrackets: 'always',
                        autoClosingQuotes: 'always',
                        autoIndent: 'full',
                        formatOnPaste: true,
                        formatOnType: true,
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: {
                            other: true,
                            comments: false,
                            strings: false,
                        },
                        parameterHints: { enabled: true },
                        folding: true,
                        foldingStrategy: 'indentation',
                        showFoldingControls: 'always',
                        renderLineHighlight: 'all',
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                        padding: { top: 16, bottom: 16 },
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            useShadows: true,
                            verticalScrollbarSize: 12,
                            horizontalScrollbarSize: 12,
                        },
                    }}
                />
            </Paper>

            {/* Output Section - Tabular Test Results */}
            {output && (
                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        bgcolor: '#ffffff',
                        borderRadius: 3,
                        border: '2px solid #e0e0e0',
                        maxHeight: 500,
                        overflow: 'auto',
                    }}
                >
                    {/* Header with Overall Result */}
                    <Box sx={{
                        mb: 3,
                        p: 2.5,
                        borderRadius: 2,
                        background: (() => {
                            const allPassed = testResults.length > 0 && testResults.every(r => r.passed);
                            const visibleTests = testResults.filter(r => !r.isHidden);
                            const allVisiblePassed = visibleTests.length > 0 && visibleTests.every(r => r.passed);
                            const someHiddenFailed = testResults.some(r => r.isHidden && !r.passed);

                            if (allPassed) {
                                return 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'; // All pass - Green
                            } else if (allVisiblePassed && someHiddenFailed) {
                                return 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)'; // Visible pass, hidden fail - Yellow
                            } else {
                                return 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)'; // Some visible failed - Red
                            }
                        })(),
                        color: 'white',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            📊 Test Results
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.95 }}>
                            {output}
                        </Typography>
                    </Box>

                    {/* Test Cases Table */}
                    <Stack spacing={2.5}>
                        {testResults.map((res, i) => {
                            const testCaseNum = i + 1;
                            const bgColor = res.passed
                                ? 'rgba(76, 175, 80, 0.08)'
                                : 'rgba(244, 67, 54, 0.08)';
                            const borderColor = res.passed ? '#4caf50' : '#f44336';

                            return (
                                <Paper
                                    key={i}
                                    elevation={2}
                                    sx={{
                                        p: 2.5,
                                        bgcolor: bgColor,
                                        border: `2px solid ${borderColor}`,
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: `0 6px 20px ${res.passed ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                >
                                    {/* Test Case Header */}
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: 2,
                                        pb: 1.5,
                                        borderBottom: `2px solid ${borderColor}`,
                                    }}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 700,
                                            color: borderColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}>
                                            {res.passed ? '✅' : '❌'}
                                            Test Case {testCaseNum}
                                            {res.isHidden && (
                                                <Chip
                                                    label="Hidden"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(0,0,0,0.1)',
                                                        color: borderColor,
                                                        fontWeight: 600,
                                                        fontSize: '0.7rem',
                                                    }}
                                                />
                                            )}
                                        </Typography>
                                        <Chip
                                            label={res.passed ? 'PASSED' : 'FAILED'}
                                            sx={{
                                                bgcolor: borderColor,
                                                color: 'white',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                px: 1,
                                            }}
                                        />
                                    </Box>

                                    {/* Test Case Details - Only show for visible tests */}
                                    {!res.isHidden && (
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                                            gap: 2,
                                        }}>
                                            {/* Input Box */}
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    bgcolor: 'white',
                                                    border: '2px solid #2196f3',
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: '#2196f3',
                                                        mb: 1,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        fontSize: '0.75rem',
                                                    }}
                                                >
                                                    📥 Input
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.9rem',
                                                        color: '#37474f',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        minHeight: '40px',
                                                        p: 1,
                                                        bgcolor: '#f5f5f5',
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    {res.input || '(empty)'}
                                                </Typography>
                                            </Paper>

                                            {/* Expected Output Box */}
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    bgcolor: 'white',
                                                    border: '2px solid #4caf50',
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: '#4caf50',
                                                        mb: 1,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        fontSize: '0.75rem',
                                                    }}
                                                >
                                                    ✓ Expected
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.9rem',
                                                        color: '#37474f',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        minHeight: '40px',
                                                        p: 1,
                                                        bgcolor: '#f5f5f5',
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    {res.expected || '(empty)'}
                                                </Typography>
                                            </Paper>

                                            {/* Actual Output Box */}
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    bgcolor: 'white',
                                                    border: `2px solid ${res.passed ? '#4caf50' : '#f44336'}`,
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: res.passed ? '#4caf50' : '#f44336',
                                                        mb: 1,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        fontSize: '0.75rem',
                                                    }}
                                                >
                                                    📤 Output
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.9rem',
                                                        color: '#37474f',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        minHeight: '40px',
                                                        p: 1,
                                                        bgcolor: '#f5f5f5',
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    {res.actual || '(empty)'}
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    )}

                                    {/* Hidden Test Case Message */}
                                    {res.isHidden && (
                                        <Box sx={{
                                            textAlign: 'center',
                                            py: 2,
                                            opacity: 0.7,
                                        }}>
                                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
                                                🔒 Test case details are hidden for evaluation
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            );
                        })}
                    </Stack>
                </Paper>
            )}

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                <Button
                    variant="contained"
                    size="large"
                    endIcon={<NavigateNextIcon />}
                    onClick={handleNext}
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #653a8a 100%)' },
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 5,
                        py: 1.5,
                        fontSize: '1rem',
                    }}
                >
                    {isLastQuestion ? '🏁 Finish Test' : 'Next Question →'}
                </Button>
            </Box>
        </Box>
    );
}

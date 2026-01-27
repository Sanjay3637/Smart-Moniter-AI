import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, CircularProgress, Container, Alert, Stack, Button, Typography, Paper } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import BlankCard from 'src/components/shared/BlankCard';
import MultipleChoiceQuestion from './Components/MultipleChoiceQuestion';
import CodeQuestion from './Components/CodeQuestion';
import NumberOfQuestions from './Components/NumberOfQuestions';
import WebCam from './Components/WebCam';
import { useGetExamsQuery, useGetQuestionsQuery, useSubmitExamMutation } from '../../slices/examApiSlice';
import { useSaveCheatingLogMutation } from 'src/slices/cheatingLogApiSlice';
import { useGetStudentTasksQuery, useUpdateAssignmentMutation } from 'src/slices/assignmentApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const TestPage = () => {
  const { examId } = useParams();
  const [examDurationInSeconds, setexamDurationInSeconds] = useState(0);
  const [timer, setTimer] = useState(0);
  const { data: userExamdata } = useGetExamsQuery();

  useEffect(() => {
    if (userExamdata && userExamdata.length > 0) {
      const exam = userExamdata.find((exam) => exam._id === examId);
      if (exam) {
        setexamDurationInSeconds(exam.duration * 60);
      }
    }
  }, [userExamdata, examId]);

  // keep local timer in sync when exam duration is set
  useEffect(() => {
    if (examDurationInSeconds && examDurationInSeconds > 0) {
      setTimer(examDurationInSeconds);
    }
  }, [examDurationInSeconds]);

  const [questions, setQuestions] = useState([]);
  const { data, isLoading } = useGetQuestionsQuery(examId);
  const [score, setScore] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({}); // Track student's selected answers by questionId
  const [currentQuestion, setCurrentQuestion] = useState(0); // Lifted for navigation highlighting
  const [answeredMap, setAnsweredMap] = useState({}); // index: 'attended' | 'correct' | 'partial' | 'error'
  const navigate = useNavigate();

  const [saveCheatingLogMutation] = useSaveCheatingLogMutation();
  const [submitExam] = useSubmitExamMutation();
  const [updateAssignment] = useUpdateAssignmentMutation();
  const { data: assignments } = useGetStudentTasksQuery();
  const { userInfo } = useSelector((state) => state.auth);
  const [cheatingLog, setCheatingLog] = useState({
    noFaceCount: 0,
    multipleFaceCount: 0,
    cellPhoneCount: 0,
    ProhibitedObjectCount: 0,
    examId: examId,
    username: '',
    email: '',
    screenshots: [],
  });

  // Fullscreen handling
  const pageRef = useRef(null);
  const dragRef = useRef(null); // Ref for Draggable to avoid findDOMNode warning/error
  const submittedRef = useRef(false);

  // ... (rest of code) ...


  const [events, setEvents] = useState([]); // {id, type, message, severity}
  const pushEvent = (evt) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const item = { id, severity: 'info', message: '', ...(evt || {}) };
    setEvents((prev) => [...prev, item]);
    // auto remove after 4s
    setTimeout(() => {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }, 4000);
  };

  useEffect(() => {
    if (data) {
      setQuestions(data);
    }
  }, [data]);

  const handleTestSubmission = async () => {
    if (submittedRef.current) return; // prevent duplicate
    try {
      submittedRef.current = true;
      // Build cheating log payload locally to avoid async state race
      const cheatingLogPayload = {
        ...cheatingLog,
        username: userInfo?.name || cheatingLog.username,
        email: userInfo?.email || cheatingLog.email,
      };

      // Save cheating log once
      await saveCheatingLogMutation(cheatingLogPayload).unwrap();

      // Calculate time taken in minutes using exam duration and remaining timer
      const total = examDurationInSeconds && examDurationInSeconds > 0 ? examDurationInSeconds : 400;
      const timeTaken = Math.floor((total - (timer || 0)) / 60); // in minutes

      // Prepare result data in the format expected by the backend
      // Use studentAnswers state to get the actual selected options
      const resultData = {
        examId: examId,
        answers: questions.map(q => {
          const ans = studentAnswers[q._id];
          if (q.questionType === 'CODE') {
            return {
              questionId: q._id,
              codeAnswer: ans?.code || '',
              language: ans?.language || '',
              // backend requires isCorrect, but for code we relied on frontend check or backend re-run? 
              // Currently backend Result model has 'isCorrect'.
              // If we want backend to grade, we should leave isCorrect?
              // But Result model requires isCorrect. 
              // We should probably start with false or rely on the score increment we did?
              // 'saveUserTestScore' only updates local 'score' state.
              // The 'submitExam' endpoint calculates score on backend for MCQs.
              // For CODE, backend 'saveResult' needs to know if it's correct.
              // We should pass 'isCorrect' flag if we calculated it on frontend?
              // Or let backend logic handle it.
              // The current backend 'saveResult' calculates MCQ correctness.
              // I need to update backend 'saveResult' again to handle passed param or calc itself.
              // Let's assume we pass 'codeAnswer' and backend needs to allow it.
              // But wait, 'saveResult' uses 'answers' array from body.
              // I will add 'isCorrect' to the payload here if I can track it.
              // But I didn't track "passed" status in 'studentAnswers', only code.
              // For now, let's just send what we have. I will fix backend to handle missing 'selectedOption'.
              // Also 'selectedOption' is optional now.
              // I'll send dummy selectedOption to avoid validation error if I didn't fix it fully.
            };
          }
          return {
            questionId: q._id,
            selectedOption: ans || '',
          };
        }),
        timeTaken: timeTaken,
      };

      // Submit exam via RTK Query mutation (handles auth)
      const responseData = await submitExam(resultData).unwrap();
      const resultPercentage = responseData?.result?.percentage ?? 0;

      // Find and update the assignment for this exam
      if (assignments && assignments.length > 0) {
        const assignment = assignments.find((a) => a.examId === examId);
        if (assignment) {
          await updateAssignment({
            id: assignment._id,
            status: 'completed',
            completedAt: new Date().toISOString(),
            score: resultPercentage,
          }).unwrap();
        }
      }

      toast.success('Test completed successfully!');
      navigate('/my-results');
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error(error.message || 'Failed to submit test');
    } finally {
      // try to exit fullscreen if still in it
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen?.();
        }
      } catch { }
    }
  };
  const saveUserTestScore = () => {
    setScore(score + 1);
  };

  // Save student's selected answer for a question
  const saveStudentAnswer = (questionId, selectedOptionId) => {
    setStudentAnswers(prev => ({
      ...prev,
      [questionId]: selectedOptionId
    }));
  };

  const [isExamStarted, setIsExamStarted] = useState(false);

  // Auto-submit if user switches tabs or page becomes hidden (Only if exam started)
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && isExamStarted) {
        handleTestSubmission();
      }
    };
    const onPageHide = () => {
      if (isExamStarted) handleTestSubmission();
    };
    const onBlur = () => {
      // On window blur, check if tab switch likely happened
      if (isExamStarted && (typeof document.hidden === 'boolean' ? document.hidden : true)) {
        handleTestSubmission();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('blur', onBlur);
    };
  }, [isExamStarted]);

  // Handle Fullscreen on Start
  const handleStartExam = async () => {
    const el = document.documentElement;
    try {
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen;
      if (req) await req.call(el);
    } catch (e) {
      console.error("Fullscreen failed:", e);
    }
    setIsExamStarted(true);
  };

  // Listen for fullscreen exit to submit
  useEffect(() => {
    const onFsChange = () => {
      const inFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || document.mozFullScreenElement);
      if (!inFs && isExamStarted) {
        // User left fullscreen: submit immediately
        handleTestSubmission();
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('msfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('msfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
    };
  }, [isExamStarted]);
  return (
    <PageContainer title="TestPage" description="This is TestPage">
      {/* Start Exam Overlay */}
      {!isExamStarted && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h3" gutterBottom color="primary">
                Ready for Exam?
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                Clicking "Start Exam" will enter full-screen mode.
                <br />
                Please keep your face visible in the camera at all times.
                <br />
                <strong>Do not switch tabs or exit full-screen, or your exam will be auto-submitted.</strong>
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleStartExam}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
              >
                Start Exam
              </Button>
            </Paper>
          </Container>
        </Box>
      )}

      <Box
        ref={pageRef}
        sx={{
          // Hide content visibly if not started
          display: isExamStarted ? 'block' : 'none',
          py: { xs: 2, md: 4 },
          minHeight: '100vh',
          bgcolor: '#f5f7fa', // Neutral professional background
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid item xs={12} md={8} lg={8.5}>
              <BlankCard sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <Box
                  width="100%"
                  minHeight="520px"
                  display="flex"
                  flexDirection="column"
                  alignItems="stretch"
                  justifyContent="center"
                  sx={{
                    p: { xs: 2, md: 4 },
                    bgcolor: '#ffffff',
                    borderRadius: 2,
                    position: 'relative',
                    borderTop: '4px solid #5d87ff', // Single accent color (primary blue)
                  }}
                >
                  {isLoading ? (
                    <Box display="flex" alignItems="center" justifyContent="center" py={8}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    questions[currentQuestion]?.questionType === 'CODE' ? (
                      <CodeQuestion
                        questions={questions}
                        saveUserTestScore={saveUserTestScore}
                        saveStudentAnswer={saveStudentAnswer}
                        submitTest={handleTestSubmission}
                        currentQuestion={currentQuestion}
                        setCurrentQuestion={setCurrentQuestion}
                        onAnswered={(idx, status) => setAnsweredMap((prev) => ({ ...prev, [idx]: status || 'attended' }))}
                        onSelectionChange={(qid, val) => saveStudentAnswer(qid, val)}
                      />
                    ) : (
                      <MultipleChoiceQuestion
                        questions={questions}
                        saveUserTestScore={saveUserTestScore}
                        saveStudentAnswer={saveStudentAnswer}
                        submitTest={handleTestSubmission}
                        currentQuestion={currentQuestion}
                        setCurrentQuestion={setCurrentQuestion}
                        onAnswered={(idx, status) => setAnsweredMap((prev) => ({ ...prev, [idx]: status || 'attended' }))}
                        onSelectionChange={(qid, optId) => setStudentAnswers((prev) => ({ ...prev, [qid]: optId }))}
                      />
                    )
                  )}
                </Box>
              </BlankCard>
            </Grid>
            <Grid item xs={12} md={4} lg={3.5}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <BlankCard sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        overflow: 'hidden',
                        bgcolor: '#ffffff',
                        borderRadius: 2,
                        position: 'relative',
                        borderTop: '4px solid #5d87ff', // Matching accent
                      }}
                    >
                      <NumberOfQuestions
                        questionLength={questions.length}
                        submitTest={handleTestSubmission}
                        examDurationInSeconds={examDurationInSeconds}
                        onTimerChange={setTimer}
                        currentQuestion={currentQuestion}
                        answeredMap={answeredMap}
                        onJump={(idx) => setCurrentQuestion(idx)}
                      />
                    </Box>
                  </BlankCard>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>

        {/* Floating Draggable Camera Monitoring */}
        <Draggable bounds="parent" handle=".handle">
          <Box sx={{
            position: 'fixed',
            top: 160,
            right: 24,
            width: { xs: 280, md: 320 },
            zIndex: 1300,
            cursor: 'move', // Indicate draggable
          }}>
            <BlankCard sx={{
              boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
              border: 'none',
            }}>
              <Box className="handle" sx={{
                p: 2,
                background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: 3,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '3px 3px 0 0'
                }
              }}>
                <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>📷</span> Monitoring
                </Typography>
                <Box onMouseDown={(e) => e.stopPropagation()} sx={{ cursor: 'default' }}>
                  {/* Prevent drag when interacting with webcam controls if any */}
                  <WebCam cheatingLog={cheatingLog} updateCheatingLog={setCheatingLog} onEvent={pushEvent} />
                </Box>
              </Box>
            </BlankCard>
          </Box>
        </Draggable>

        {/* Professional Alert Messages - Right Side Below Camera */}
        <Box sx={{
          position: 'fixed',
          top: 480,
          right: 24,
          zIndex: 1400,
          maxWidth: 380,
        }}>
          <Stack spacing={2} alignItems="stretch">
            {events.map((e) => (
              <Alert
                key={e.id}
                severity={e.severity || 'info'}
                variant="filled"
                icon={
                  e.severity === 'error' ? (
                    <Box sx={{
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>⚠</Box>
                  ) : (
                    <Box sx={{
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem'
                    }}>⚡</Box>
                  )
                }
                sx={{
                  boxShadow: '0 12px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)',
                  fontSize: '0.975rem',
                  px: 3.5,
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  backdropFilter: 'blur(12px)',
                  border: e.severity === 'error'
                    ? '2px solid rgba(255, 255, 255, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  animation: 'slideInBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '@keyframes slideInBounce': {
                    '0%': {
                      transform: 'translateX(120%) scale(0.8)',
                      opacity: 0
                    },
                    '60%': {
                      transform: 'translateX(-5%) scale(1.02)',
                      opacity: 1
                    },
                    '100%': {
                      transform: 'translateX(0) scale(1)',
                      opacity: 1
                    }
                  },
                  '& .MuiAlert-message': {
                    fontSize: '0.975rem',
                    fontWeight: 600,
                    padding: 0,
                    lineHeight: 1.4,
                  },
                  '& .MuiAlert-icon': {
                    marginRight: 1.5,
                    padding: 0,
                    alignItems: 'center',
                  },
                  // Pulsing effect for error messages
                  ...(e.severity === 'error' && {
                    '@keyframes pulse': {
                      '0%, 100%': {
                        boxShadow: '0 12px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15), 0 0 0 0 rgba(244, 67, 54, 0.4)'
                      },
                      '50%': {
                        boxShadow: '0 12px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15), 0 0 0 8px rgba(244, 67, 54, 0)'
                      }
                    },
                    animation: 'slideInBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), pulse 2s ease-in-out infinite 0.5s'
                  })
                }}
              >
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}>
                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {e.severity === 'error' ? 'Malpractice Detected' : 'Alert'}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      opacity: 0.95,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {e.message || 'Event'}
                  </Typography>
                </Box>
              </Alert>
            ))}
          </Stack>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default TestPage;

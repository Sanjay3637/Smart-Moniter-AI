import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, CircularProgress, Container, Alert, Stack } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import BlankCard from 'src/components/shared/BlankCard';
import MultipleChoiceQuestion from './Components/MultipleChoiceQuestion';
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
  const [answeredMap, setAnsweredMap] = useState({}); // index: true if answered
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
  });

  // Fullscreen handling
  const pageRef = useRef(null);
  const submittedRef = useRef(false);

  // In-exam notifications (overlay Alerts)
  const [events, setEvents] = useState([]); // {id, type, message, severity}
  const pushEvent = (evt) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
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
        answers: questions.map(q => ({
          questionId: q._id,
          selectedOption: studentAnswers[q._id] || '', // Use tracked answer
        })),
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
      } catch {}
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

  // Request fullscreen on mount and auto-submit on exit
  useEffect(() => {
    const el = pageRef.current || document.documentElement;

    const requestFS = async () => {
      try {
        const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen;
        if (req) await req.call(el);
      } catch (e) {
        // best-effort; browser may require user gesture
      }
    };

    const onFsChange = () => {
      const inFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || document.mozFullScreenElement);
      if (!inFs) {
        // User left fullscreen: submit immediately
        handleTestSubmission();
      }
    };

    // try once when questions load (user navigated here)
    requestFS();
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
  }, []);

  // Auto-submit if user switches tabs or page becomes hidden
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        handleTestSubmission();
      }
    };
    const onPageHide = () => {
      handleTestSubmission();
    };
    const onBlur = () => {
      // On window blur, check if tab switch likely happened
      if (typeof document.hidden === 'boolean' ? document.hidden : true) {
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
  }, []);
  return (
    <PageContainer title="TestPage" description="This is TestPage">
      <Box
        ref={pageRef}
        sx={{
          py: { xs: 2, md: 4 },
          minHeight: '100vh',
          backgroundImage: `radial-gradient(800px 320px at -10% -10%, rgba(99,102,241,0.12), transparent),
                            radial-gradient(700px 280px at 110% -10%, rgba(236,72,153,0.12), transparent),
                            linear-gradient(180deg, #fafafa 0%, #f3f5f9 100%)`,
          backgroundAttachment: 'fixed',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid item xs={12} md={8} lg={8}>
              <BlankCard>
                <Box
                  width="100%"
                  minHeight="520px"
                  display="flex"
                  flexDirection="column"
                  alignItems="stretch"
                  justifyContent="center"
                  sx={{
                    p: { xs: 1.5, md: 3 },
                    background: 'rgba(255,255,255,0.85)',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  {isLoading ? (
                    <Box display="flex" alignItems="center" justifyContent="center" py={8}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <MultipleChoiceQuestion
                      questions={questions}
                      saveUserTestScore={saveUserTestScore}
                      saveStudentAnswer={saveStudentAnswer}
                      submitTest={handleTestSubmission}
                      currentQuestion={currentQuestion}
                      setCurrentQuestion={setCurrentQuestion}
                      onAnswered={(idx) => setAnsweredMap((prev) => ({ ...prev, [idx]: true }))}
                      onSelectionChange={(qid, optId) => setStudentAnswers((prev) => ({ ...prev, [qid]: optId }))}
                    />
                  )}
                </Box>
              </BlankCard>
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <BlankCard>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        background: 'rgba(255,255,255,0.8)',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'grey.200',
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
                <Grid item xs={12}>
                  <BlankCard>
                    <Box sx={{ p: 1.25, background: 'rgba(255,255,255,0.8)', borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
                      <WebCam cheatingLog={cheatingLog} updateCheatingLog={setCheatingLog} onEvent={pushEvent} />
                    </Box>
                  </BlankCard>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
        {/* Overlay alerts visible in fullscreen too */}
        <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1400 }}>
          <Stack spacing={1.25} alignItems="stretch">
            {events.map((e) => (
              <Alert
                key={e.id}
                severity={e.severity || 'info'}
                variant="filled"
                sx={{
                  boxShadow: 4,
                  fontSize: '1rem',
                  px: 2,
                  py: 1.5,
                  minWidth: 340,
                  borderRadius: 2,
                }}
              >
                {e.message || 'Event'}
              </Alert>
            ))}
          </Stack>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default TestPage;

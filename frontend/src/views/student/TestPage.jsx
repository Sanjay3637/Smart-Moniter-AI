import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, CircularProgress, Container } from '@mui/material';
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

  useEffect(() => {
    if (data) {
      setQuestions(data);
    }
  }, [data]);

  const handleTestSubmission = async () => {
    try {
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
  return (
    <PageContainer title="TestPage" description="This is TestPage">
      <Box
        sx={{
          py: { xs: 2, md: 4 },
          backgroundImage: `radial-gradient(700px 300px at 0% -10%, rgba(99, 102, 241, 0.10), transparent),
                            radial-gradient(600px 250px at 100% 0%, rgba(236, 72, 153, 0.10), transparent)`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={7} lg={7}>
              <BlankCard>
                <Box
                  width="100%"
                  minHeight="440px"
                  display="flex"
                  flexDirection="column"
                  alignItems="stretch"
                  justifyContent="center"
                  sx={{ p: { xs: 1, md: 2 } }}
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
            <Grid item xs={12} md={5} lg={5}>
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
                    <Box sx={{ p: 1 }}>
                      <WebCam cheatingLog={cheatingLog} updateCheatingLog={setCheatingLog} />
                    </Box>
                  </BlankCard>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </PageContainer>
  );
};

export default TestPage;

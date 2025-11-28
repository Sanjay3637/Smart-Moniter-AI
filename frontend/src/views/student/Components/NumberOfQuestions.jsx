import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import { Box, Button, Stack, Typography } from '@mui/material';
import Countdown from 'react-countdown';
const NumberOfQuestions = ({ questions = [], answersMap = {}, submitTest, examDurationInSeconds, onTimerChange }) => {
  const totalQuestions = Array.isArray(questions) ? questions.length : 0;
  // Generate an array of question numbers from 1 to totalQuestions
  const questionNumbers = Array.from({ length: totalQuestions }, (_, index) => index + 1);
  const handleQuestionButtonClick = (questionNumber) => {
    // Set the current question to the selected question number
    // setCurrentQuestion(questionNumber);
  };

  // Create an array of rows, each containing up to 4 question numbers
  const rows = [];
  for (let i = 0; i < questionNumbers.length; i += 5) {
    rows.push(questionNumbers.slice(i, i + 5));
  }

  // Timer related states - initialize from prop or fallback to 400 seconds
  const initialSeconds = typeof examDurationInSeconds === 'number' && examDurationInSeconds > 0 ? examDurationInSeconds : 400;
  const [timer, setTimer] = useState(initialSeconds);

  // Countdown timer
  useEffect(() => {
    // reset timer when examDurationInSeconds changes
    setTimer(initialSeconds);
    if (onTimerChange) onTimerChange(initialSeconds);

    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        const next = prevTimer - 1;
        if (onTimerChange) onTimerChange(next > 0 ? next : 0);
        if (next <= 0) {
          clearInterval(countdown);
          // ensure we call submitTest once when timer reaches zero
          try {
            submitTest();
          } catch (e) {
            // swallow submit errors to avoid crashing UI
            // caller will show error/toast as needed
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(countdown); // Cleanup the timer when the component unmounts
    };
  }, [initialSeconds]); // restart when initialSeconds changes

  return (
    <>
      <Box
        position="sticky"
        top="0"
        zIndex={1}
        bgcolor="white" // Set background color as needed
        paddingY="10px" // Add padding to top and bottom as needed
        width="100%"
        px={3}
        // mb={5}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Questions: {totalQuestions}</Typography>
          <Typography variant="h6">
            Time Left: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </Typography>
          <Button variant="contained" onClick={submitTest} color="error">
            Finish Test
          </Button>
        </Stack>
      </Box>

      <Box p={3} mt={5} maxHeight="270px">
        <Grid container spacing={1}>
          {rows.map((row, rowIndex) => (
            <Grid key={rowIndex} item xs={12}>
              <Stack direction="row" alignItems="center" justifyContent="start">
                {row.map((questionNumber) => {
                  const q = questions[questionNumber - 1];
                  const isAnswered = q && answersMap && !!answersMap[q._id];
                  const bg = isAnswered ? '#22c55e' : '#ef4444'; // green or red
                  return (
                    <Avatar
                      key={questionNumber}
                      variant="rounded"
                      style={{
                        width: '40px',
                        height: '40px',
                        fontSize: '20px',
                        cursor: 'pointer',
                        margin: '3px',
                        background: bg,
                        color: '#fff',
                      }}
                      onClick={() => handleQuestionButtonClick(questionNumber)}
                    >
                      {questionNumber}
                    </Avatar>
                  );
                })}
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default NumberOfQuestions;

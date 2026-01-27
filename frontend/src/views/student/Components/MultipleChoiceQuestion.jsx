import React, { useEffect, useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

export default function MultipleChoiceQuestion({ questions, saveUserTestScore, saveStudentAnswer, submitTest, currentQuestion = 0, setCurrentQuestion, onAnswered, onSelectionChange }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);

  const [isLastQuestion, setIsLastQuestion] = useState(false);

  useEffect(() => {
    if (questions && questions.length > 0) {
      setIsLastQuestion(currentQuestion === questions.length - 1);
    }
  }, [currentQuestion, questions]);

  // helpers to normalize option fields
  const getOptionKey = (option, idx) => option?._id || option?.id || String(idx);
  const getOptionLabel = (option) => option?.optionText || option?.text || '';

  // Check if questions exist and have data
  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error">
            No questions available for this exam.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const handleOptionChange = (event) => {
    const nextVal = event.target.value;
    setSelectedOption(nextVal);
    // propagate to parent immediately to avoid losing last selection on auto-submit
    const q = questions[currentQuestion] || {};
    const currentQuestionId = q._id || q.id || String(currentQuestion);
    if (onSelectionChange) {
      onSelectionChange(currentQuestionId, nextVal);
    }
  };

  const handleNextQuestion = () => {
    // Save the student's answer for this question
    const q = questions[currentQuestion] || {};
    const currentQuestionId = q._id || q.id || String(currentQuestion);
    if (saveStudentAnswer && selectedOption) {
      saveStudentAnswer(currentQuestionId, selectedOption);
    }
    // Check if answer is correct for local scoring
    const opts = Array.isArray(q.options) ? q.options : [];
    const correct = opts.find((option) => option.isCorrect);
    let isCorrect = false;
    if (correct) {
      const correctKey = getOptionKey(correct, opts.indexOf(correct));
      isCorrect = String(correctKey) === String(selectedOption);
    }

    if (onAnswered && selectedOption) {
      // For MCQ: correct (Green) or error/wrong (Red)
      // If we don't want to reveal answer immediately, we might just use 'attended' (White/Blue?)
      // But user asked for: "if attend and there is error... red".
      // Assuming instant feedback style based on request descriptions.
      // If "attended" means just selected, but "error" means wrong answer.
      onAnswered(currentQuestion, isCorrect ? 'correct' : 'error');
    }
    if (isCorrect) {
      setScore(score + 1);
      saveUserTestScore();
    }

    setSelectedOption(null);
    if (currentQuestion < questions.length - 1 && setCurrentQuestion) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (submitTest) {
      // if this was the last question, submit immediately
      submitTest();
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Question {currentQuestion + 1}
        </Typography>
        <Typography variant="h6" mb={2}>
          {questions[currentQuestion]?.question || ''}
        </Typography>
        <Box mb={2}>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              aria-label="quiz"
              name="quiz"
              value={selectedOption}
              onChange={handleOptionChange}
            >
              {(questions[currentQuestion]?.options || []).map((option, idx) => {
                const key = getOptionKey(option, idx);
                const label = getOptionLabel(option);
                return (
                  <FormControlLabel
                    key={key}
                    value={String(key)}
                    control={<Radio />}
                    label={label}
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
        </Box>
        <Stack direction="row" spacing={2}>
          <Box flexGrow={1} />
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextQuestion}
            disabled={selectedOption === null}
          >
            {isLastQuestion ? 'Finish' : 'Next Question'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

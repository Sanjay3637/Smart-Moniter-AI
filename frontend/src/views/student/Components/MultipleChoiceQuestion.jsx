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

export default function MultipleChoiceQuestion({ questions, saveUserTestScore, saveStudentAnswer, submitTest }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
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
    setSelectedOption(event.target.value);
  };

  const handleNextQuestion = () => {
    // Save the student's answer for this question
    const q = questions[currentQuestion] || {};
    const currentQuestionId = q._id || q.id || String(currentQuestion);
    if (saveStudentAnswer && selectedOption) {
      saveStudentAnswer(currentQuestionId, selectedOption);
    }

    // Check if answer is correct for local scoring
    let isCorrect = false;
    const opts = Array.isArray(q.options) ? q.options : [];
    const correct = opts.find((option) => option.isCorrect);
    if (correct) {
      const correctKey = getOptionKey(correct, opts.indexOf(correct));
      isCorrect = String(correctKey) === String(selectedOption);
    }
    if (isCorrect) {
      setScore(score + 1);
      saveUserTestScore();
    }

    setSelectedOption(null);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (submitTest) {
      // if this was the last question, submit immediately
      submitTest();
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={3}>
          Question {currentQuestion + 1}:
        </Typography>
        <Typography variant="body1" mb={3}>
          {questions[currentQuestion]?.question || ''}
        </Typography>
        <Box mb={3}>
          <FormControl component="fieldset">
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
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="contained"
            color="primary"
            onClick={handleNextQuestion}
            disabled={selectedOption === null}
            style={{ marginLeft: 'auto' }}
          >
            {isLastQuestion ? 'Finish' : 'Next Question'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

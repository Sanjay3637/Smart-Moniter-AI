import React from 'react';
import { Grid, Box, Card, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import ExamForm from './components/ExamForm';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useGetCategoriesQuery, useCreateCategoryMutation, useCreateExamMutation } from '../../slices/examApiSlice.js';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { TextField, Button } from '@mui/material';
import { useState } from 'react';

const examValidationSchema = yup.object({
  examName: yup.string().required('Exam Name is required'),
  totalQuestions: yup
    .number()
    .typeError('Total Number of Questions must be a number')
    .integer('Total Number of Questions must be an integer')
    .positive('Total Number of Questions must be positive')
    .required('Total Number of Questions is required'),
  duration: yup
    .number()
    .typeError('Exam Duration must be a number')
    .integer('Exam Duration must be an integer')
    .min(1, 'Exam Duration must be at least 1 minute')
    .required('Exam Duration is required'),
  liveDate: yup.date().required('Live Date and Time is required'),
  deadDate: yup.date().required('Dead Date and Time is required'),
});

const CreateExamPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryParam = params.get('category');

  const initialExamValues = {
    examName: '',
    totalQuestions: '',
    duration: '',
    liveDate: '',
    deadDate: '',
    category: categoryParam && categoryParam !== 'uncategorized' ? categoryParam : '',
  };

  const formik = useFormik({
    initialValues: initialExamValues,
    validationSchema: examValidationSchema,
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  const [createExam] = useCreateExamMutation();
  const { data: categories, refetch: refetchCategories } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [newCategory, setNewCategory] = useState('');

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return toast.error('Category name required');
    try {
      await createCategory({ name: newCategory }).unwrap();
      toast.success('Category created');
      setNewCategory('');
      refetchCategories();
    } catch (err) {
      toast.error(err?.data?.message || err.message || err.error || 'Failed to create category');
    }
  };

  const handleSubmit = async (values) => {
    try {
      await createExam(values).unwrap();
      toast.success('Exam Created successfully');
      formik.resetForm();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <PageContainer title="Create Exam" description="Create a new exam">
      <Box
        sx={{
          position: 'relative',
          '&:before': {
            content: '""',
            background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: '0.3',
          },
        }}
      >
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid
            item
            xs={12}
            sm={12}
            lg={12}
            xl={6}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '600px' }}>
              <Box mb={2}>
                <Typography variant="subtitle1" mb={1}>
                  Create new category
                </Typography>
                <Box display="flex" gap={1} mb={2} alignItems="center">
                  <TextField size="small" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="e.g. End Semester" fullWidth />
                  <Button variant="contained" onClick={handleCreateCategory}>Create</Button>
                </Box>
              </Box>

              <ExamForm
                formik={formik}
                onSubmit={handleSubmit}
                categories={categories}
                title={
                  <Typography variant="h3" textAlign="center" color="textPrimary" mb={1}>
                    Create Exam
                  </Typography>
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default CreateExamPage;

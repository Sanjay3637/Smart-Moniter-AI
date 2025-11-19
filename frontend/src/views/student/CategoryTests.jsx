import React from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Box, Typography, Button } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import BlankCard from 'src/components/shared/BlankCard';
import ExamCard from './Components/ExamCard';
import { useGetExamsQuery, useGetCategoriesQuery } from 'src/slices/examApiSlice';

const CategoryTests = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: exams = [], isLoading, isError } = useGetExamsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();

  if (isLoading) return <PageContainer title="Category Tests">Loading...</PageContainer>;
  if (isError) return <PageContainer title="Category Tests">Error loading tests</PageContainer>;

  // Support a special 'uncategorized' category id to show exams without a category
  const category =
    categoryId === 'uncategorized'
      ? { _id: 'uncategorized', name: 'Uncategorized' }
      : categories.find((c) => c._id === categoryId) || { name: 'Category' };

  const filtered =
    categoryId === 'uncategorized'
      ? exams.filter((e) => !e.category || !e.category._id)
      : exams.filter((e) => e.category && e.category._id === categoryId);

  return (
    <PageContainer title={`Tests — ${category.name}`} description={`Tests under ${category.name}`}>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">{category.name}</Typography>
        {userInfo?.role === 'teacher' && (
          <Button variant="contained" onClick={() => navigate(`/create-exam?category=${categoryId}`)}>Create Test</Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {filtered.length > 0 ? (
          filtered.map((exam) => (
            <Grid item sm={6} md={4} lg={3} key={exam._id}>
              <BlankCard>
                <ExamCard exam={exam} />
              </BlankCard>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography color="textSecondary">No tests found in this category.</Typography>
          </Grid>
        )}
      </Grid>
    </PageContainer>
  );
};

export default CategoryTests;

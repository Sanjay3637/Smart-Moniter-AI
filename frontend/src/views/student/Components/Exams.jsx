import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Box, Button, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import BlankCard from 'src/components/shared/BlankCard';
import { useGetExamsQuery, useGetCategoriesQuery } from 'src/slices/examApiSlice';
import defaultCategoryImg from 'src/assets/images/final-exam-results-test-reading-books-words-concept.jpg';
import { useNavigate } from 'react-router-dom';


const Exams = () => {
  // Fetch exam data from the backend using useGetExamsQuery
  const { data: userExams = [], isLoading, isError } = useGetExamsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const examsByCategory = useMemo(() => {
    const map = {};
    // initialize with categories (sorted by name)
    (categories || [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((c) => {
        map[c._id] = { category: c, exams: [] };
      });
    // Uncategorized bucket
    map.uncategorized = { category: { _id: 'uncategorized', name: 'Uncategorized' }, exams: [] };

    (userExams || [])
      .slice()
      .sort((a, b) => (a.examName || '').localeCompare(b.examName || ''))
      .forEach((exam) => {
        if (exam.category && exam.category._id && map[exam.category._id]) {
          map[exam.category._id].exams.push(exam);
        } else {
          map.uncategorized.exams.push(exam);
        }
      });

    return Object.values(map);
  }, [userExams, categories]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching exams.</div>;
  }

  return (
    <PageContainer title="Exams" description="List of exams grouped by category">
      {/* Render categories-only: each category is a card with name, count, and actions */}
      <Grid container spacing={3}>
        {examsByCategory.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group.category._id}>
            <BlankCard>
              {/* category image / preview */}
              <Box
                component="img"
                src={group.category.image || defaultCategoryImg || `https://source.unsplash.com/800x400/?${encodeURIComponent(group.category.name || 'education')}`}
                alt={group.category.name}
                sx={{ width: '100%', height: 140, objectFit: 'cover', borderTopLeftRadius: 6, borderTopRightRadius: 6 }}
              />
              <Box p={2}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/exam/category/${group.category._id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') navigate(`/exam/category/${group.category._id}`);
                    }}
                    sx={{ cursor: 'pointer', minWidth: 0 }}
                  >
                    <Typography variant="h6" noWrap>{group.category.name}</Typography>
                    <Typography color="textSecondary" variant="body2">{(group.exams && group.exams.length) || 0} tests</Typography>
                    {group.category.description ? (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {group.category.description.length > 120 ? `${group.category.description.slice(0, 120)}...` : group.category.description}
                      </Typography>
                    ) : null}
                  </Box>
                  {userInfo?.role === 'teacher' && (
                    <Button size="small" variant="outlined" onClick={() => navigate(`/create-exam?category=${group.category._id}`)}>
                      Create Test
                    </Button>
                  )}
                </Box>
              </Box>
            </BlankCard>
          </Grid>
        ))}
      </Grid>
    </PageContainer>
  );
};

export default Exams;

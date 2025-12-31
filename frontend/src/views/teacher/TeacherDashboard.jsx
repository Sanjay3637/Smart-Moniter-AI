import React, { useMemo } from 'react';
import { Box, Typography, Grid, Stack, Button, Divider, Chip } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { useSelector } from 'react-redux';
import BlankCard from 'src/components/shared/BlankCard';
import { useGetExamsQuery } from 'src/slices/examApiSlice';
import { useGetTeacherAssignmentsQuery } from 'src/slices/assignmentApiSlice';
import { Link, useNavigate } from 'react-router-dom';
import { IconPlus, IconFileText, IconUsers, IconClipboardList, IconLock } from '@tabler/icons-react';

const TeacherDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: exams = [], isLoading: isExamsLoading } = useGetExamsQuery();
  const { data: teacherAssignments = [], isLoading: isAssignLoading } = useGetTeacherAssignmentsQuery();
  const navigate = useNavigate();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  }, []);

  // Scope exams to those created by this teacher when a marker exists
  const teacherId = userInfo?._id || userInfo?.id;
  const myExams = (Array.isArray(exams) ? exams : []).filter((e) => {
    const createdById = e?.createdBy?._id || e?.createdBy || e?.teacherId || e?.ownerId;
    return createdById ? createdById === teacherId : true; // if unknown, include (backend may already filter)
  });

  // Teacher KPIs
  const totalExams = myExams.length;
  const totalAssignments = Array.isArray(teacherAssignments) ? teacherAssignments.length : 0;
  const uniqueStudents = new Set(
    (Array.isArray(teacherAssignments) ? teacherAssignments : [])
      .map((a) => a.student?._id || a.studentId || a.assigneeId || a.userId)
      .filter(Boolean)
  ).size;

  // Recent exams (last 5)
  const recentExams = myExams
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 5);

  // Quick actions
  const quickActions = [
    { label: 'Create Exam', icon: IconPlus, path: '/create-exam', color: 'primary' },
    { label: 'Add Questions', icon: IconFileText, path: '/add-questions', color: 'secondary' },
    { label: 'Manage Exams', icon: IconClipboardList, path: '/manage-exams', color: 'info' },
    { label: 'Assign Exam', icon: IconUsers, path: '/assign-exam', color: 'success' },
    { label: 'Block Student', icon: IconLock, path: '/block-student', color: 'error' },
  ];

  return (
    <PageContainer title="Teacher Dashboard" description="Welcome">
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: { xs: 1, md: 2 } }}>
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            py: { xs: 2.5, md: 3 },
            borderRadius: 4,
            background: 'linear-gradient(180deg, rgba(99,102,241,0.10), rgba(236,72,153,0.10))',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 8px 26px rgba(15,23,42,0.08)',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {greeting}, {userInfo?.name ? userInfo.name.split(' ')[0] : 'Teacher'}
          </Typography>
        </Box>
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <BlankCard>
            <Box p={2.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Exams Created
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
                {totalExams}
              </Typography>
              <Button
                component={Link}
                to="/manage-exams"
                size="small"
                variant="text"
                sx={{ mt: 1.5 }}
              >
                Manage Exams →
              </Button>
            </Box>
          </BlankCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <BlankCard>
            <Box p={2.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Students Assigned
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
                {uniqueStudents}
              </Typography>
              <Button
                component={Link}
                to="/assign-exam"
                size="small"
                variant="text"
                sx={{ mt: 1.5 }}
              >
                Assign Exam →
              </Button>
            </Box>
          </BlankCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <BlankCard>
            <Box p={2.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Assignments
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
                {totalAssignments}
              </Typography>
              <Button
                component={Link}
                to="/exam-log"
                size="small"
                variant="text"
                sx={{ mt: 1.5 }}
              >
                View Logs →
              </Button>
            </Box>
          </BlankCard>
        </Grid>
      </Grid>

      {/* Quick Actions + Recent Exams */}
      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={6}>
          <BlankCard>
            <Box p={2.25}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Quick Actions
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Grid container spacing={1.5}>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Grid item xs={6} sm={6} key={action.path}>
                      <Button
                        component={Link}
                        to={action.path}
                        variant="outlined"
                        color={action.color}
                        fullWidth
                        startIcon={<Icon size={18} />}
                        sx={{ py: 1.25, justifyContent: 'flex-start' }}
                      >
                        {action.label}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </BlankCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <BlankCard>
            <Box p={2.25}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Recent Exams
                </Typography>
                <Button size="small" variant="text" onClick={() => navigate('/manage-exams')}>
                  View all
                </Button>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1.5}>
                {recentExams.length > 0 ? (
                  recentExams.map((exam) => (
                    <Stack
                      key={exam._id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                          {exam.examName || 'Untitled Exam'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {exam.category?.name || 'Uncategorized'} • {exam.totalQuestions || 0}{' '}
                          questions
                        </Typography>
                      </Box>
                      <Chip
                        label={exam.duration ? `${exam.duration}m` : 'N/A'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No exams created yet. Start by creating your first exam.
                  </Typography>
                )}
              </Stack>
            </Box>
          </BlankCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default TeacherDashboard;

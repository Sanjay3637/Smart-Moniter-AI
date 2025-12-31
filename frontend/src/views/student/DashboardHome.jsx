import React, { useMemo } from 'react';
import { Box, Typography, Grid, CircularProgress, LinearProgress, Stack, Tooltip } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { useSelector } from 'react-redux';
import BlankCard from 'src/components/shared/BlankCard';
import { useGetResults } from 'src/slices/resultsApiSlice';
import { useGetStudentTasksQuery } from 'src/slices/assignmentApiSlice';

const DashboardHome = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { results = [], isLoading: resultsLoading } = useGetResults();
  const resultsList = Array.isArray(results)
    ? results
    : (results?.results || results?.data?.results || results?.data || []);
  const { data: assignments = [] } = useGetStudentTasksQuery();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  }, []);

  // Helper to normalize percentage from different result shapes
  const num = (v) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };
  const getPercent = (r) => {
    const p1 = r?.percentage ?? r?.percentageScore ?? r?.percent;
    const pn = num(p1);
    if (pn > 0) return Math.max(0, Math.min(100, Math.round(pn)));
    const score = num(r?.score ?? r?.marksObtained ?? r?.obtained ?? r?.correctAnswers ?? r?.correct ?? 0);
    const totalQ = num(r?.totalQuestions ?? r?.examTotalQuestions ?? r?.questions ?? r?.total ?? 0);
    const totalMarks = num(r?.totalMarks ?? r?.maxMarks ?? 0);
    const p2 = totalQ > 0 ? (score / totalQ) * 100 : (totalMarks > 0 ? (score / totalMarks) * 100 : 0);
    return Math.max(0, Math.min(100, Math.round(p2)));
  };

  // KPIs
  const recent = (Array.isArray(resultsList) ? resultsList : [])
    .slice()
    .sort((a, b) => new Date(b.submittedAt || b.updatedAt || b.createdAt || 0) - new Date(a.submittedAt || a.updatedAt || a.createdAt || 0))
    .slice(0, 6);
  const recentPercents = recent.map(getPercent).reverse();
  const passCount = (Array.isArray(resultsList) ? resultsList : []).filter((r) => {
    const p = getPercent(r);
    const status = (r?.status || r?.resultStatus || '').toString().toLowerCase();
    const isPassed = r?.isPassed === true || r?.passed === true || status === 'pass' || status === 'passed';
    return isPassed ? true : (status ? status === 'passed' : p >= 60);
  }).length;
  const passRate = (Array.isArray(resultsList) && resultsList.length > 0) ? Math.round((passCount / resultsList.length) * 100) : 0;
  const totalTasks = Array.isArray(assignments) ? assignments.length : 0;
  const completedTasks = Array.isArray(assignments) ? assignments.filter((a) => a.status === 'completed').length : 0;
  const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <PageContainer title="Dashboard" description="Welcome">
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: { xs: 1, md: 2 } }}>
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            py: { xs: 2.5, md: 3 },
            borderRadius: 4,
            background: 'linear-gradient(180deg, rgba(99,102,241,0.10), rgba(236,72,153,0.10))',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 8px 26px rgba(15,23,42,0.08)'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {greeting}, {userInfo?.name ? userInfo.name.split(' ')[0] : 'User'}
          </Typography>
        </Box>
      </Box>

      {/* Overview mini-cards */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <BlankCard>
            <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Pass Rate</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{passRate}%</Typography>
              </Box>
              <Box position="relative" display="inline-flex">
                <CircularProgress variant="determinate" value={passRate} size={64} thickness={5} color={passRate >= 60 ? 'success' : 'error'} />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {passRate}%
                </Box>
              </Box>
            </Box>
          </BlankCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <BlankCard>
            <Box p={2}>
              <Typography variant="subtitle2" color="text.secondary">Tasks Completed</Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1, mb: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{completedTasks}/{totalTasks}</Typography>
                <Typography variant="body2" color="text.secondary">{taskPct}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={taskPct} color={taskPct >= 60 ? 'success' : 'primary'} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          </BlankCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <BlankCard>
            <Box p={2}>
              <Typography variant="subtitle2" color="text.secondary">Recent Scores</Typography>
              <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ mt: 2, minHeight: 64 }}>
                {recentPercents.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No recent results</Typography>
                ) : (
                  recentPercents.map((v, idx) => (
                    <Tooltip key={idx} title={`${v}%`} arrow>
                      <Box sx={{ width: 14, height: Math.max(10, Math.round((v / 100) * 60)), borderRadius: 1, backgroundColor: v >= 60 ? 'success.main' : 'error.main', opacity: 0.9 }} />
                    </Tooltip>
                  ))
                )}
              </Stack>
            </Box>
          </BlankCard>
        </Grid>
      </Grid>

      {/* Performance trend graph */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <BlankCard>
            <Box p={2}>
              <Typography variant="subtitle2" color="text.secondary">Performance Trend</Typography>
              {resultsLoading ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading...</Typography>
              ) : (Array.isArray(results) && results.length > 0 ? (
                (() => {
                  const last = results.slice(-12); // up to last 12 results
                  const points = last.map(getPercent);
                  const W = 600, H = 140, P = 10;
                  const n = points.length;
                  const max = Math.max(100, ...points);
                  const min = Math.min(0, ...points);
                  const toX = (i) => P + (n <= 1 ? 0 : (i * (W - 2 * P)) / (n - 1));
                  const toY = (v) => P + (H - 2 * P) - ((v - min) / (max - min || 1)) * (H - 2 * P);
                  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ');
                  return (
                    <Box sx={{ overflowX: 'auto', mt: 2 }}>
                      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.2" />
                          </linearGradient>
                        </defs>
                        <path d={d} fill="none" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" />
                        {points.map((v, i) => (
                          <circle key={i} cx={toX(i)} cy={toY(v)} r="3" fill="#6366F1" />
                        ))}
                      </svg>
                    </Box>
                  );
                })()
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No data yet. Take a test to see your performance trend.</Typography>
              ))}
            </Box>
          </BlankCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default DashboardHome;

import React, { useMemo, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Chip,
    Alert,
    Tabs,
    Tab,
    Stack,
    Checkbox,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
    Tooltip,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Avatar,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Refresh as RefreshIcon, Search as SearchIcon, LockOpen as LockOpenIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import { useGetAllUsersQuery, useDeleteUserMutation, useRegisterMutation, useUnblockUserMutation, useLazyGetStudentHistoryQuery } from 'src/slices/usersApiSlice';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as yup from 'yup';

const userValidationSchema = yup.object({
    name: yup.string().min(2).max(25).required('Please enter name'),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    rollNumber: yup.string().when('role', {
        is: 'student',
        then: (schema) => schema.required('Roll number is required for students'),
        otherwise: (schema) => schema.notRequired(),
    }),
    password: yup
        .string()
        .min(6, 'Password should be of minimum 6 characters length')
        .required('Password is required'),
    role: yup.string().oneOf(['student', 'teacher'], 'Invalid role').required('Role is required'),
});

const AdminPage = () => {
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const navigate = useNavigate();

    const { data: users, isLoading, refetch } = useGetAllUsersQuery();
    const [deleteUser] = useDeleteUserMutation();
    const [register, { isLoading: isRegistering }] = useRegisterMutation();

    const [tab, setTab] = useState('students');
    const [query, setQuery] = useState('');

    const handleAdminLogout = () => {
        localStorage.removeItem('isAdmin');
        navigate('/auth/admin-login');
    };

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            rollNumber: '',
            dob: '',
            password: '',
            role: 'student',
        },
        validationSchema: userValidationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                const payload = { name: values.name, email: values.email, password: values.password, role: values.role, dob: values.dob };
                if (values.role === 'student') payload.rollNumber = values.rollNumber;

                await register(payload).unwrap();
                toast.success('User created successfully!');
                resetForm();
                setOpenCreateDialog(false);
                refetch();
            } catch (err) {
                toast.error(err?.data?.message || err.error || 'Failed to create user');
            }
        },
    });

    const [unblockUser] = useUnblockUserMutation();
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [triggerHistory, { data: historyData, isFetching: isHistoryLoading }] = useLazyGetStudentHistoryQuery();
    const [resetCount, setResetCount] = useState(false);

    const handleOpenUnblock = (student) => {
        setSelectedStudent(student);
        setResetCount(false);
        setOpenHistoryDialog(true);
        triggerHistory({ rollNumber: student.rollNumber });
    };

    const handleUnblockUser = async () => {
        if (!selectedStudent) return;
        try {
            await unblockUser({ rollNumber: selectedStudent.rollNumber, resetCount }).unwrap();
            toast.success(`Unblocked ${selectedStudent.name}!`);
            setOpenHistoryDialog(false);
            setSelectedStudent(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to unblock');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId).unwrap();
            toast.success('User deleted successfully!');
            setDeleteConfirm(null);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || err.error || 'Failed to delete user');
        }
    };

    return (
        <PageContainer title="Admin - User Management" description="Manage user accounts">
            <Box>
                <Card>
                    <CardContent>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems="center" mb={4}>
                            <Typography variant="h4" fontWeight={700}>User Management</Typography>
                            <Stack direction="row" spacing={2}>
                                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()} sx={{ px: 3 }}>Refresh</Button>
                                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreateDialog(true)} sx={{ px: 3 }}>Create Account</Button>
                                <Button variant="outlined" color="error" onClick={handleAdminLogout} sx={{ px: 3 }}>Logout</Button>
                            </Stack>
                        </Stack>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" mb={3}>
                            <Tabs
                                value={tab}
                                onChange={(_, v) => setTab(v)}
                                sx={{
                                    flexShrink: 0,
                                    '& .MuiTab-root': { fontSize: '1rem', minHeight: 48, textTransform: 'none' }
                                }}
                            >
                                <Tab value="students" label={`Students${users ? ` (${users.filter(u => u.role === 'student').length})` : ''}`} />
                                <Tab value="teachers" label={`Teachers${users ? ` (${users.filter(u => u.role === 'teacher').length})` : ''}`} />
                                <Tab value="blocked" label={`Blocked${users ? ` (${users.filter(u => u.isBlocked).length})` : ''}`} sx={{ color: 'error.main' }} />
                            </Tabs>
                            <Box sx={{ flexGrow: 1 }} />
                            <Box sx={{ position: 'relative', width: { xs: '100%', md: 360 } }}>
                                <TextField
                                    fullWidth
                                    placeholder="Search name, email, roll..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                                    }}
                                />
                            </Box>
                        </Stack>

                        {isLoading ? (
                            <Typography>Loading users...</Typography>
                        ) : users && users.length > 0 ? (
                            <UsersGrid
                                users={users}
                                tab={tab}
                                query={query}
                                onAskDelete={(u) => setDeleteConfirm(u)}
                                onAskUnblock={(u) => handleOpenUnblock(u)}
                            />
                        ) : (
                            <Alert severity="info">No users found</Alert>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Create User Dialog */}
            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Account</DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="name"
                                    name="name"
                                    label="Full Name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="email"
                                    name="email"
                                    label="Email"
                                    type="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="dob"
                                    name="dob"
                                    label="Date of Birth"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={formik.values.dob}
                                    onChange={formik.handleChange}
                                    error={formik.touched.dob && Boolean(formik.errors.dob)}
                                    helperText={formik.touched.dob && formik.errors.dob}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        id="role"
                                        name="role"
                                        value={formik.values.role}
                                        label="Role"
                                        onChange={formik.handleChange}
                                    >
                                        <MenuItem value="student">Student</MenuItem>
                                        <MenuItem value="teacher">Teacher</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {formik.values.role === 'student' && (
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="rollNumber"
                                        name="rollNumber"
                                        label="Roll Number"
                                        value={formik.values.rollNumber}
                                        onChange={formik.handleChange}
                                        error={formik.touched.rollNumber && Boolean(formik.errors.rollNumber)}
                                        helperText={formik.touched.rollNumber && formik.errors.rollNumber}
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="password"
                                    name="password"
                                    label="Password"
                                    type="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    error={formik.touched.password && Boolean(formik.errors.password)}
                                    helperText={formik.touched.password && formik.errors.password}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={isRegistering}>
                            {isRegistering ? 'Creating...' : 'Create Account'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete user <strong>{deleteConfirm?.name}</strong>?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    <Button
                        onClick={() => handleDeleteUser(deleteConfirm._id)}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* History/Unblock Dialog */}
            <Dialog open={openHistoryDialog} onClose={() => setOpenHistoryDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={selectedStudent?.profilePic} sx={{ width: 40, height: 40 }}>
                        {selectedStudent?.name?.charAt(0)}
                    </Avatar>
                    Unblock Student: {selectedStudent?.name}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Review malpractice history before unblocking. current count: {selectedStudent?.malpracticeCount}
                        </Typography>
                        {isHistoryLoading ? (
                            <Typography>Loading history...</Typography>
                        ) : historyData ? (
                            <Stack spacing={2}>
                                <Card variant="outlined">
                                    <Box sx={{ p: 2 }}>
                                        <Typography variant="subtitle2">Summary</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            No Face: {historyData.summary?.noFaceCount || 0} | Multiple Face: {historyData.summary?.multipleFaceCount || 0} | Phone: {historyData.summary?.cellPhoneCount || 0} | Prohibited: {historyData.summary?.prohibitedObjectCount || 0} | Events: {historyData.summary?.events || 0}
                                        </Typography>
                                    </Box>
                                </Card>
                                <Card variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                                    <Box sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Cheating Logs</Typography>
                                        {historyData.cheatingLogs?.length ? (
                                            <Stack spacing={1}>
                                                {historyData.cheatingLogs.map((l, i) => (
                                                    <Box key={i} sx={{ p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                                                        <Typography variant="subtitle2">{l.examName || l.examId}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(l.createdAt).toLocaleString()} - NoFace: {l.noFaceCount}, MultiFace: {l.multipleFaceCount}, Phone: {l.cellPhoneCount}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No cheating logs found</Typography>
                                        )}
                                    </Box>
                                </Card>
                            </Stack>
                        ) : null}

                        <FormControlLabel
                            control={<Checkbox checked={resetCount} onChange={(e) => setResetCount(e.target.checked)} />}
                            label="Reset malpractice count to 0"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHistoryDialog(false)}>Cancel</Button>
                    <Button onClick={handleUnblockUser} variant="contained" color="success">
                        Confirm Unblock
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer >
    );
};

export default AdminPage;

// Internal grid component for clarity
const UsersGrid = ({ users, tab, query, onAskDelete, onAskUnblock }) => {
    const filtered = useMemo(() => {
        let byRole = [];
        if (tab === 'students') {
            byRole = users.filter((u) => u.role === 'student');
        } else if (tab === 'teachers') {
            byRole = users.filter((u) => u.role === 'teacher');
        } else if (tab === 'blocked') {
            byRole = users.filter((u) => u.isBlocked);
        }

        if (!query) return byRole;
        const q = query.toLowerCase();
        return byRole.filter((u) =>
            (u.name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.rollNumber || '').toLowerCase().includes(q)
        );
    }, [users, tab, query]);

    const columns = useMemo(() => [
        {
            field: 'profilePic',
            headerName: '',
            width: 60,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Avatar
                    src={params.value}
                    sx={{ width: 35, height: 35, bgcolor: 'primary.main' }}
                >
                    {params.row.name?.charAt(0)}
                </Avatar>
            ),
        },
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 200, valueGetter: (p) => p.row.email || '-' },
        {
            field: 'dob',
            headerName: 'Age',
            width: 100,
            valueGetter: (p) => {
                if (!p.row.dob) return '-';
                const ageDiffMs = Date.now() - new Date(p.row.dob).getTime();
                const ageDate = new Date(ageDiffMs);
                return Math.abs(ageDate.getUTCFullYear() - 1970);
            }
        },
        { field: 'rollNumber', headerName: 'Roll Number', flex: 1, minWidth: 140, valueGetter: (p) => p.row.rollNumber || '-' },
        {
            field: 'role', headerName: 'Role', width: 120,
            renderCell: (params) => <Chip label={params.value} color={params.value === 'teacher' ? 'primary' : 'secondary'} size="small" />,
        },
        // Show malpractice count specifically for blocked tab
        ...(tab === 'blocked' ? [{
            field: 'malpracticeCount',
            headerName: 'Malpractice',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => <Chip label={params.value || 0} size="small" color="warning" />
        }] : []),
        {
            field: 'status', headerName: 'Status', width: 120,
            valueGetter: (p) => (p.row.isBlocked ? 'Blocked' : 'Active'),
            renderCell: (params) => (
                params.value === 'Blocked' ? <Chip label="Blocked" color="error" size="small" /> : <Chip label="Active" color="success" size="small" />
            ),
            sortable: false,
        },
        {
            field: 'actions', headerName: 'Actions', width: 160, sortable: false, filterable: false,
            renderCell: (params) => (
                <Stack direction="row" spacing={0}>
                    {params.row.isBlocked && (
                        <Tooltip title="Unblock Student">
                            <IconButton
                                color="success"
                                onClick={() => onAskUnblock(params.row)}
                                size="small"
                            >
                                <LockOpenIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Delete User">
                        <IconButton color="error" onClick={() => onAskDelete(params.row)} size="small">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ], [onAskDelete]);

    const rows = useMemo(() => filtered.map((u) => ({ id: u._id, ...u })), [filtered]);

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[5, 10, 25]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                disableRowSelectionOnClick
                density="standard"
                // Clean styling
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    '& .MuiDataGrid-columnHeaders': {
                        bgcolor: 'background.paper',
                        fontWeight: 700,
                    },
                    '& .MuiDataGrid-row:hover': {
                        bgcolor: 'action.hover',
                    },
                }}
            />
        </Box>
    );
};

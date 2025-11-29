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
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';
import { useGetAllUsersQuery, useDeleteUserMutation, useRegisterMutation } from 'src/slices/usersApiSlice';
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
            password: '',
            role: 'student',
        },
        validationSchema: userValidationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                const payload = { name: values.name, email: values.email, password: values.password, role: values.role };
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
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} mb={2}>
                            <Typography variant="h4" fontWeight={600}>User Management</Typography>
                            <Stack direction="row" spacing={1}>
                                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>Refresh</Button>
                                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreateDialog(true)}>Create Account</Button>
                                <Button variant="outlined" color="error" onClick={handleAdminLogout}>Admin Logout</Button>
                            </Stack>
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} mb={2}>
                            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ flexShrink: 0 }}>
                                <Tab value="students" label={`Students${users ? ` (${users.filter(u=>u.role==='student').length})` : ''}`} />
                                <Tab value="teachers" label={`Teachers${users ? ` (${users.filter(u=>u.role==='teacher').length})` : ''}`} />
                            </Tabs>
                            <Box sx={{ flexGrow: 1 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 320 } }}>
                                <SearchIcon color="action" />
                                <TextField fullWidth size="small" placeholder="Search name, email, roll..." value={query} onChange={(e)=>setQuery(e.target.value)} />
                            </Box>
                        </Stack>

                        {isLoading ? (
                            <Typography>Loading users...</Typography>
                        ) : users && users.length > 0 ? (
                            <UsersGrid users={users} tab={tab} query={query} onAskDelete={(u)=>setDeleteConfirm(u)} />
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
        </PageContainer>
    );
};

export default AdminPage;

// Internal grid component for clarity
const UsersGrid = ({ users, tab, query, onAskDelete }) => {
    const filtered = useMemo(() => {
        const byRole = users.filter((u) => (tab === 'students' ? u.role === 'student' : u.role === 'teacher'));
        if (!query) return byRole;
        const q = query.toLowerCase();
        return byRole.filter((u) =>
            (u.name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.rollNumber || '').toLowerCase().includes(q)
        );
    }, [users, tab, query]);

    const columns = useMemo(() => [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 200, valueGetter: (p) => p.row.email || '-' },
        { field: 'rollNumber', headerName: 'Roll Number', flex: 1, minWidth: 140, valueGetter: (p) => p.row.rollNumber || '-' },
        {
            field: 'role', headerName: 'Role', width: 120,
            renderCell: (params) => <Chip label={params.value} color={params.value === 'teacher' ? 'primary' : 'secondary'} size="small" />,
        },
        {
            field: 'status', headerName: 'Status', width: 120,
            valueGetter: (p) => (p.row.isBlocked ? 'Blocked' : 'Active'),
            renderCell: (params) => (
                params.value === 'Blocked' ? <Chip label="Blocked" color="error" size="small" /> : <Chip label="Active" color="success" size="small" />
            ),
            sortable: false,
        },
        {
            field: 'actions', headerName: 'Actions', width: 110, sortable: false, filterable: false,
            renderCell: (params) => (
                <IconButton color="error" onClick={() => onAskDelete(params.row)} size="small">
                    <DeleteIcon />
                </IconButton>
            ),
        },
    ], [onAskDelete]);

    const rows = useMemo(() => filtered.map((u) => ({ id: u._id, ...u })), [filtered]);

    return (
        <Box sx={{ height: 520, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[5, 10, 25]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                disableRowSelectionOnClick
                density="compact"
                showCellVerticalBorder
                showColumnVerticalBorder
                sx={{
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'grey.500',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: 'action.hover',
                        borderBottom: '1px solid',
                        borderColor: 'grey.500',
                    },
                    '& .MuiDataGrid-row': {
                        borderBottom: '1px solid',
                        borderColor: 'grey.500',
                    },
                    '& .MuiDataGrid-cell': {
                        borderRight: '1px solid',
                        borderColor: 'grey.500',
                    },
                    '& .MuiDataGrid-cell:last-of-type': {
                        borderRight: 'none',
                    },
                }}
            />
        </Box>
    );
};

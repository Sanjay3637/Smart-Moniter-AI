import { apiSlice } from './apiSlice';

const ASSIGNMENTS_URL = '/api/assignments';

export const assignmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create assignment (teacher)
    createAssignment: builder.mutation({
      query: (data) => ({
        url: ASSIGNMENTS_URL,
        method: 'POST',
        body: data,
      }),
    }),
    // Get teacher's assignments
    getTeacherAssignments: builder.query({
      query: () => ({
        url: ASSIGNMENTS_URL,
        method: 'GET',
      }),
    }),
    // Get student's assigned tasks
    getStudentTasks: builder.query({
      query: () => ({
        url: `${ASSIGNMENTS_URL}/my-tasks`,
        method: 'GET',
      }),
    }),
    // Update assignment
    updateAssignment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ASSIGNMENTS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    // Delete assignment
    deleteAssignment: builder.mutation({
      query: (id) => ({
        url: `${ASSIGNMENTS_URL}/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useCreateAssignmentMutation,
  useGetTeacherAssignmentsQuery,
  useGetStudentTasksQuery,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
} = assignmentApiSlice;

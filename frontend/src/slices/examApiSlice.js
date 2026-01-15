import { apiSlice } from './apiSlice';

// Define the base URL for the exams API
const EXAMS_URL = '/api/exams';

// Inject endpoints for the exam slice
export const examApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all exams
    getExams: builder.query({
      query: () => ({
        url: `${EXAMS_URL}`,
        method: 'GET',
      }),
    }),
    // Categories
    getCategories: builder.query({
      query: () => ({
        url: `${EXAMS_URL}/categories`,
        method: 'GET',
      }),
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: `${EXAMS_URL}/categories`,
        method: 'POST',
        body: data,
      }),
    }),
    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `${EXAMS_URL}/categories/${categoryId}`,
        method: 'DELETE',
      }),
    }),
    // Create a new exam
    createExam: builder.mutation({
      query: (data) => ({
        url: `${EXAMS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),
    // Get questions for a specific exam
    getQuestions: builder.query({
      query: (examId) => ({
        url: `${EXAMS_URL}/questions/${examId}`,
        method: 'GET',
      }),
    }),
    // Create a new question for an exam
    createQuestion: builder.mutation({
      query: (data) => ({
        url: `${EXAMS_URL}/questions`,
        method: 'POST',
        body: data,
      }),
    }),
    // Delete an exam
    deleteExam: builder.mutation({
      query: (examId) => ({
        url: `${EXAMS_URL}/${examId}`,
        method: 'DELETE',
      }),
    }),
    // Submit exam answers
    submitExam: builder.mutation({
      query: (data) => ({
        url: `/api/submission/submit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Result'],
    }),
    // Teacher: set/update exam access code (password)
    updateExamAccessCode: builder.mutation({
      query: ({ id, accessCode }) => ({
        url: `${EXAMS_URL}/${id}/access-code`,
        method: 'PUT',
        body: { accessCode },
      }),
    }),
    // Student: validate access code before starting exam
    validateExamAccess: builder.mutation({
      query: ({ examId, code }) => ({
        url: `${EXAMS_URL}/${examId}/validate-access`,
        method: 'POST',
        body: { code },
      }),
    }),
  }),
});

// Export the generated hooks for each endpoint
export const {
  useGetExamsQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateExamMutation,
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useDeleteExamMutation,
  useUpdateExamAccessCodeMutation,
  useValidateExamAccessMutation,
  useSubmitExamMutation,
} = examApiSlice;

import { apiSlice } from './apiSlice';

// Define the base URL for the exams API
const EXAMS_URL = '/api/users';

// Inject endpoints for the exam slice
export const examApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all exams
    getExams: builder.query({
      query: () => ({
        url: `${EXAMS_URL}/exam`,
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
        url: `${EXAMS_URL}/exam`,
        method: 'POST',
        body: data,
      }),
    }),
    // Get questions for a specific exam
    getQuestions: builder.query({
      query: (examId) => ({
        url: `${EXAMS_URL}/exam/questions/${examId}`,
        method: 'GET',
      }),
    }),
    // Create a new question for an exam
    createQuestion: builder.mutation({
      query: (data) => ({
        url: `${EXAMS_URL}/exam/questions`,
        method: 'POST',
        body: data,
      }),
    }),
    // Delete an exam
    deleteExam: builder.mutation({
      query: (examId) => ({
        url: `${EXAMS_URL}/exam/${examId}`,
        method: 'DELETE',
      }),
    }),
    // Submit exam answers
    submitExam: builder.mutation({
      query: (data) => ({
        url: `/api/exams/submit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Result'],
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
  useSubmitExamMutation,
} = examApiSlice;

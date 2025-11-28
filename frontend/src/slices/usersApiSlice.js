import { apiSlice } from './apiSlice';
const USERS_URL = '/api/users';

// inject endpoint we can create our enpoint here
// and the got injected in api slice endpoints part
// now in form we just have to hit this login action
export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    //Login Api
    login: builder.mutation({
      //data contain email,password

      query: (data) => ({
        // backend url
        url: `${USERS_URL}/auth`,
        method: 'POST',
        body: data,
      }),
    }),
    //Register Mutation Api
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),
    // LogOut Api
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
    }),
    // Fetch current user's profile
    getProfile: builder.query({
      query: () => ({
        url: `${USERS_URL}/profile`,
        method: 'GET',
      }),
      providesTags: ['UserProfile'],
    }),
    // Teacher-only: unblock a student
    unblockUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/unblock`,
        method: 'POST',
        body: data, // { email or rollNumber, resetCount? }
      }),
    }),
    // Teacher-only: block a student
    blockUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/block`,
        method: 'POST',
        body: data, // { email or rollNumber }
      }),
    }),
    // Admin: get all users
    getAllUsers: builder.query({
      query: () => ({
        url: `${USERS_URL}/all`,
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),
    // Admin: delete a user
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

// it specify convention to export them
// like for mutation we have to add use + name + Mutation
// like for query we have to add use + name + query
export const { useLoginMutation, useLogoutMutation, useRegisterMutation, useUpdateUserMutation, useGetProfileQuery, useUnblockUserMutation, useBlockUserMutation, useGetAllUsersQuery, useDeleteUserMutation } =
  userApiSlice;

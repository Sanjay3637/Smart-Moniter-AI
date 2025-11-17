import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const baseQuery = fetchBaseQuery({ 
  baseUrl: '',
  prepareHeaders: (headers) => {
    // Get the JWT token from cookies
    const token = Cookies.get('jwt');
    
    // If we have a token, set the authorization header
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // Important: Set credentials to include for sending cookies
    headers.set('credentials', 'include');
    headers.set('Access-Control-Allow-Credentials', 'true');
    
    return headers;
  },
  credentials: 'include', // This is important for sending cookies with the request
});

export const apiSlice = createApi({
  baseQuery: async (args, api, extraOptions) => {
    try {
      const result = await baseQuery(args, api, extraOptions);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  tagTypes: ['User', 'Results', 'CheatingLogs'],
  endpoints: (builder) => ({}),
});

//pomodoroApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// 'http://localhost:4000/api/'
const pomodorosApi = createApi({
  reducerPath: "pomodorosApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${process.env.REACT_APP_API_BASE_URL}`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Pomodoro'], 
  endpoints: (builder) => ({
    getpomodoros: builder.query({
      query: () => (`pomodoro`),
      providesTags: ['Pomodoro'], 
    }),
    
    getSinglePomodoro: builder.query({
      query: ({ pomodoroId }) => `pomodoro/session_details/${pomodoroId}`,
      providesTags: (result, error, { pomodoroId }) => [
        { type: 'Pomodoro', id: pomodoroId } 
      ],
    }),
    
    createPomodoro: builder.mutation({
      query: (formData) => ({
        url: "pomodoro/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['Pomodoro'], 
    }),
    
    updatePomodoro: builder.mutation({
      query: ({ pomodoroId, formData }) => ({
        url: `pomodoro/update/${pomodoroId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result, error, { pomodoroId }) => [
        'Pomodoro', 
        { type: 'Pomodoro', id: pomodoroId } 
      ],
    }),
    
    deletePomodoro: builder.mutation({
      query: ({ pomodoroId }) => ({
        url: `pomodoro/delete/${pomodoroId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Pomodoro'], 
    }),
    clearAllSessions: builder.mutation({
      query :() => ({
        url:'pomodoro/clear-all-sessions',
        method:"DELETE"
      }),
      invalidatesTags: ['Pomodoro'],
    })

  }),
});

export const {
    useGetpomodorosQuery,
    useGetSinglePomodoroQuery,
    useCreatePomodoroMutation,
    useUpdatePomodoroMutation,
    useDeletePomodoroMutation,
    useClearAllSessionsMutation
} = pomodorosApi;

export default pomodorosApi;
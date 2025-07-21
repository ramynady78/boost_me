import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const tasksApi = createApi({
  reducerPath: "tasksApi",
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
    getTasks: builder.query({
      query: (params = {}) => {
        const { from, to, status } = params;
        const queryString = new URLSearchParams();

        if (from) queryString.append('from', from);
        if (to) queryString.append('to', to);
        if (status) queryString.append('status', status);

        return `tasks?${queryString.toString()}`;
      },
      providesTags: ['Task'], 
    }),
    
    getSingleTask: builder.query({
      query: ({ taskId }) => `tasks/task_details/${taskId}`,
      providesTags: (result, error, { taskId }) => [
        { type: 'Pomodoro', id: taskId } 
      ],
    }),
    
    createTask: builder.mutation({
      query: (formData) => ({
        url: "tasks/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['Task'], 
    }),
    
    updateTask: builder.mutation({
      query: ({ taskId, formData }) => ({
        url: `tasks/update/${taskId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        'Task', 
        { type: 'Task', id: taskId } 
      ],
    }),
    
    deleteTask: builder.mutation({
      query: ({ taskId }) => ({
        url: `tasks/delete/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Task'], 
    }),
  }),
});

export const {
    useCreateTaskMutation,
    useGetTasksQuery,
    useGetSingleTaskQuery,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
} = tasksApi;

export default tasksApi;
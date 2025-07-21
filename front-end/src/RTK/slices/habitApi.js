import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const habitsApi = createApi({
  reducerPath: "habitsApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${process.env.REACT_APP_API_BASE_URL}`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Habit'],
  endpoints: (builder) => ({
    getHabits: builder.query({
      query: (params = {}) => {
        const { repeat, date } = params;
        const queryString = new URLSearchParams();

        if (repeat) queryString.append('repeat', repeat);
        if (date) queryString.append('date', date);

        return `habits/?${queryString.toString()}`;
      },
      providesTags: ['Habit']
    }),
    createHabit: builder.mutation({
      query: (formData) => ({
        url: "habits/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['Habit'], 
    }),
    updateHabit:builder.mutation({
      query:( {habitId, formData}) =>({
        url:`habits/update/${habitId}`,
        method:"PATCH",
        body:formData
      }),
      invalidatesTags: (result, error, { taskId }) => [
        'Habit', 
        { type: 'Habit', id: taskId } 
      ]
    }),
    deleteHabit: builder.mutation({
      query:({habitId}) => ({
        url:`habits/delete/${habitId}`,
        method:"DELETE"
      }),
      invalidatesTags:["Habit"]
    })
  })
});

export const {
  useGetHabitsQuery,
  useCreateHabitMutation,
  useUpdateHabitMutation,
  useDeleteHabitMutation
} = habitsApi;

export default habitsApi;
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const userSettingsApi = createApi({
  reducerPath: "userSettingsApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:4000/api/',
    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem("token");
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['UserSettings'], 
  endpoints: (builder) => ({
    getUserSettings: builder.query({  
      query: () => ({
        url: 'user/setting',           
        method: 'GET',                 
      }),
      providesTags: ['UserSettings'], 
    }),
    
    updateUserSettings: builder.mutation({
      query: (formData) => ({           
        url: `user/setting/update`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ['UserSettings'], 
    }),
  }),
});

export const {
    useGetUserSettingsQuery,
    useUpdateUserSettingsMutation
} = userSettingsApi;

export default userSettingsApi;

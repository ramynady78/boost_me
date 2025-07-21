import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const userSettingsApi = createApi({
  reducerPath: "userSettingsApi",
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

import { configureStore } from '@reduxjs/toolkit';
import tasksApi from './slices/tasksApi';
import habitsApi from './slices/habitApi';
import userSettingsApi from './slices/userSettingApi';
import pomodorosApi from './slices/pomodoroApi';

const store = configureStore({
    reducer: {
        [tasksApi.reducerPath]: tasksApi.reducer,
        [habitsApi.reducerPath]: habitsApi.reducer,
        [userSettingsApi.reducerPath]: userSettingsApi.reducer,
        [pomodorosApi.reducerPath]: pomodorosApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(tasksApi.middleware)
            .concat(habitsApi.middleware)
            .concat(userSettingsApi.middleware)
            .concat(pomodorosApi.middleware)
});

export default store;
import { configureStore } from '@reduxjs/toolkit';
import settingReducer from './slices/settingSlice';

export default configureStore({
    reducer: {
        setting: settingReducer,
    },
});
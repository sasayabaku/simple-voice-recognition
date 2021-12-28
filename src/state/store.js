import { configureStore } from '@reduxjs/toolkit';
import settingReducer from './slices/settingSlice';
import vrgReducer from './slices/vrgSlice';

export default configureStore({
    reducer: {
        setting: settingReducer,
        vrg: vrgReducer
    },
});
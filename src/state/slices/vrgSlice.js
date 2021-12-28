import { createSlice } from '@reduxjs/toolkit';

export const vrgSlice = createSlice({
    name: "vrgStore",
    initialState: {
        sttResult: [],
        sttText: "音声認識結果",
    },
    reducers: {
        setSttText: (state, action) => {
            return {
                ...state,
                sttText: action.payload.value,
            }
        },

        setSttResult: (state, action) => {
            const newArray = [].concat(state.sttResult);
            newArray.push(action.payload.value);
            return {
                ...state,
                sttResult: newArray,
                sttText: newArray.join("\n"),
            }
        },

        resetSttResult: (state, action) => {
            return {
                ...state,
                sttResult: [],
                sttText: ""
            }
        }
    }
});

export const { setSttText, setSttResult } = vrgSlice.actions;
export const selectSttResult = state => state.vrg.sttResult;
export const selectSttText = state => state.vrg.sttText;

export default vrgSlice.reducer;
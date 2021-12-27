import { createSlice } from '@reduxjs/toolkit';

export const settingSlice = createSlice({
    name: 'settingStore',
    initialState: {
        clientId: `${process.env.COTOHA_APIID}`,
        clientSecret: `${process.env.COTOHA_APISECRET}`,
        domainId: `${process.env.COTOHA_DOMAINID}`
    },
    reducers: {
        setClientId: (state, action) => {
            return {
                ...state,
                clientId: action.payload.value,
            }
        },
        setClientSecret: (state, action) => {
            return {
                ...state,
                clientSecret: action.payload.value,
            }
        },
        setDomainId: (state, action) => {
            return {
                ...state,
                domainId: action.payload.value,
            }
        }
    }
});


export const { setClientId, setClientSecret, setDomainId } = settingSlice.actions;

export const selectClientId = state => state.setting.clientId;
export const selectClientSecret = state => state.setting.clientSecret;
export const selectDomainId = state => state.setting.domainId;

export default settingSlice.reducer;
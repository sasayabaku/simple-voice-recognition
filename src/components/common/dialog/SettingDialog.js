import React, {useState} from "react";

import {useSelector, useDispatch} from 'react-redux';
import { selectClientId, selectClientSecret, selectDomainId } from '../../../state/slices/settingSlice';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { setClientId, setClientSecret, setDomainId } from "../../../state/slices/settingSlice";

import Button from '@mui/material/Button';

const SettingDialog = (props) => {

    /*
    Bug : フォームが1文字入力するごとに，focusが外れす
    */

    const dispatch = useDispatch();

    const [value, setValue] = useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const client_Id = useSelector(selectClientId);
    const handleClientId = (event) => {
        dispatch(setClientId({value: event.target.value}));
    };

    const client_secret = useSelector(selectClientSecret);
    const handleClientSecret = (event) => {
        dispatch(setClientSecret({value: event.target.value}));
    };

    const domain_Id = useSelector(selectDomainId);
    const handleDomainId = (event) => {
        dispatch(setDomainId({value: event.target.value}));
    }

    const a11yProps = (index) => {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    };

    const TabPanel = (props) => {
        const { children, value, index, ...other } = props;

        return(
            <div
                role="tabpanel"
                hidden={ value !== index }
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{p:3}}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    };

    const SettingForm = () => {

        return(
            <Box sx={{ display: 'block', justifyContent: 'center' }}>
                <div>
                    <TextField 
                        id="cotoha_id" label="API ID" 
                        variant="standard" fullWidth 
                        defaultValue={client_Id || null} onChange={ (event) => {handleClientId(event)} }
                    />
                </div>
                <div>
                    <TextField 

                        id="cotoha_id" label="API Secret" 
                        variant="standard" fullWidth 
                        defaultValue={client_secret} onChange={ handleClientSecret }
                    />
                </div>
                <div>
                    <TextField 
                        id="cotoha_id" label="API Domain"
                        variant="standard" fullWidth
                        value={domain_Id} onChange={handleDomainId}
                    />
                </div>
            </Box>
        )
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="COTOHA API" {...a11yProps(0)} />
                    <Tab label="Item Two" {...a11yProps(1)} />
                    <Tab label="Item Three" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}><SettingForm/></TabPanel>
            <TabPanel value={value} index={1}>Item Two</TabPanel>
            <TabPanel value={value} index={2}>Item Three</TabPanel>
        </Box>
        
    );
}

export default SettingDialog;
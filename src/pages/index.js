import React, { useState } from "react";
import {useSelector, useDispatch} from 'react-redux';
import { selectClientId, selectClientSecret, selectDomainId } from '../state/slices/settingSlice';
import { selectSttText, setSttResult } from '../state/slices/vrgSlice';


import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

import Contents from './common.js';

import { speech_recognition, stop_stt, cancel_stt } from '../lib/stt.js';

const SttButton = (props) => {
    let button;
    if (props.sttStatus) {
        button = <Button variant="contained" style={{ color: "white", backgroundColor: "red" }} onClick={props.onStop}>音声認識終了</Button>;
    } else {
        button = <Button variant="contained" style={{ color: "white", backgroundColor: "red" }} onClick={props.onStart}>音声認識開始</Button>;
    }

    return (
        <>
            { button }
        </>
    )
}

const Index = () => {

    const [sttStatus, setSttStatus] = useState(false);

    const client_id = useSelector(selectClientId);
    const client_secret = useSelector(selectClientSecret);
    const domain_id = useSelector(selectDomainId);

    const stt_text = useSelector(selectSttText);
    const dispatch = useDispatch();

    const handleSttResult = (text) => {
        console.log(text)
        dispatch(setSttResult({ value: text }))
    }

    const handleStart = () => {
        setSttStatus(true);
        speech_recognition(client_id, client_secret, domain_id, (text)=> {handleSttResult(text)});
    };

    const handleStop = () => {
        setSttStatus(false);
        stop_stt();
    };

    return(
        <>
        <Contents>
            <Typography paragraph>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus nonenim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
                imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
                Convallis convallis tellus id interdum velit laoreet id donec ultrices.
                Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit
                adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra
                nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum
                leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis
                feugiat vivamus at augue. At augue eget arcu dictum varius duis at
                consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa
                sapien faucibus et molestie ac．
            </Typography>
            <Divider />
            <Typography paragraph sx={{ marginTop: '.5rem' }}>
                {stt_text}
            </Typography>

            <SttButton sttStatus={sttStatus} onStart={handleStart} onStop={handleStop} />
        </Contents>
        </>
    )
}

export default Index;
import React, {useState} from "react";

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import Contents from './common.js';

import { speech_recognition, stop_stt, cancel_stt } from '../lib/stt.js';

const SttButton = (props) => {
    let button;
    if (props.sttStatus) {
        button = <Button variant="contained" style={{ color: "red", backgroundColor: "white" }} onClick={props.onStop}>音声認識終了</Button>;
    } else {
        button = <Button variant="contained" style={{ color: "red", backgroundColor: "white" }} onClick={props.onStart}>音声認識開始</Button>;
    }

    return (
        <>
            { button }
        </>
    )
}

const Index = () => {

    const [sttStatus, setSttStatus] = useState(false);

    const handleStart = () => {
        setSttStatus(true);
        speech_recognition(client_id, client_secret, domain_id, (text)=> {console.log(text);});
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
                sapien faucibus et molestie ac.
                にほんご．日本語
            </Typography>

            <SttButton sttStatus={sttStatus} onStart={handleStart} onStop={handleStop} />
        </Contents>
        </>
    )
}

export default Index;
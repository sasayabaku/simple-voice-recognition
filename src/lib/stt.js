import axios from 'axios';

//環境変数(全ファイル共通)
const oauth_url = "https://api.ce-cotoha.com/v1/oauth/accesstokens";
const stt_api_url = "https://api.ce-cotoha.com/api/asr";

const model_name = "ja-gen_tf-16";
var cancel_flag = false;
var record_flag = false;

const buffer_size = 4096; // 0, 256, 512, 1024, 2048, 4096, 8192, 16384
const interval_time = 240; // ms

function get_token(client_id, client_secret){
    return axios.post(oauth_url, {
            "grantType": "client_credentials",
            "clientId": client_id,
            "clientSecret": client_secret
        }, {
            headers: {'Content-Type': 'application/json'},
        }).then(response =>{
            return response.data.access_token;
        }).catch(error => {
            window.alert("トークン取得エラー", error);
            return ;
        });
}

//ストリーミング音声認識
//音声認識処理(通信関連処理)
function stt_worker_func(){
    var xhr = null;
    var url = null;
    var interval_time = null;
    var start_time = null;
    var end_time = null;
    var exe_time = null;

    onmessage = function (e) {
        var cmd = e.data.cmd;
        var data = e.data.data || null;
        var uuid = e.data.uuid || null;
        var token = e.data.token || null;
        switch (cmd) {
            case "create":
                url = e.data.url;
                interval_time = e.data.interval;
                if(xhr){
                    xhr.abort();
                    xhr = null;
                }
                xhr = new XMLHttpRequest();
                xhr.withCredentials = true;
                xhr.responseType = "text";
                break;

            case "request":
                try{
                    if(xhr){
                        xhr.open("POST", url, false);
                        if(data instanceof Int16Array || data instanceof Float32Array || data instanceof ArrayBuffer) {
                            xhr.setRequestHeader("Content-Type", "application/octet-stream");
                        }
                        else{
                            xhr.setRequestHeader("Content-Type", "application/json");
                        }
                        if(uuid){
                            xhr.setRequestHeader("Unique-ID", uuid);
                        }
                        if(token){
                            xhr.setRequestHeader("Authorization", "Bearer "+token);
                        }
                        if(data){
                            if(start_time){
                                end_time = performance.now();
                                exe_time = interval_time - (end_time - start_time);
                            }
                            else{
                                exe_time = 0;
                            }
                            setTimeout(function(){
                                start_time = performance.now();
                                xhr.send(data);
                                if((200 <= xhr.status && xhr.status < 300) || (xhr.status == 304)){
                                    if(!xhr.responseText.length){
                                        postMessage({cmd:"response", data:null});
                                    }
                                    else{
                                        var res_array = JSON.parse(xhr.responseText);
                                        postMessage({cmd:"response", data:res_array});
                                    }
                                }
                                else{
                                    var res_error_array = JSON.parse(xhr.responseText);
                                    postMessage({cmd:"error", data:res_error_array});

                                }
                            }, exe_time);
                        }
                        else{
                            postMessage({cmd:"response", data:null});
                        }
                    }
                }
                catch(e){
                    postMessage({cmd:"error", data:e.message + ": " + xhr.responseText});
                }
                break;
            case "destroy" :
                if(xhr){
                    xhr.abort();
                    xhr = null;
                }
                postMessage({cmd:"destroy"});
                break;
            default :
                break;
        }
    }
}

//音声認識処理(メイン制御処理)
export async function speech_recognition(client_id, client_secret, domain_id, callback){
    var access_token = await get_token(client_id, client_secret);
    var recog_flag = false;
    cancel_flag = false;
    record_flag = false;
    var stt_worker = new Worker(URL.createObjectURL(new Blob(["("+stt_worker_func.toString()+")()"], {type: "text/javascript"})));
    var uuid = null;
    var audio_context = null;

    var audio_buffer_array = [];
    var ctx = new AudioContext();
    var sampling_rate = ctx.sampleRate;
    ctx.close();
    ctx = null;

    var chunk_size = Math.floor(sampling_rate*interval_time/1000);
    var audio_processor = null;
    var url_with_model = stt_api_url + "/v1/speech_recognition/" + model_name;

    stt_worker.postMessage({cmd:"create", url:url_with_model, interval:interval_time});

    var start_json = {
        "msg": {
            "msgname":"start"
        },
        "param": {
            "baseParam.samplingRate": sampling_rate,
            "recognizeParameter.domainId": domain_id
        }
    };

    var additional_param = {
        "baseParam.filler": false,
        "baseParam.reading": false,
        "baseParam.delimiter": false,
        "baseParam.punctuation": false,
        "recognizeParameter.enableProgress": false,
        "recognizeParameter.maxResults": 1
    };
    Object.assign(start_json.param,additional_param);

    stt_worker.postMessage({cmd:"request", data:JSON.stringify(start_json), token:access_token});

    stt_worker.addEventListener("message", function(e) {
        var cmd = e.data.cmd;
        var data = e.data.data || null;
        switch(cmd){
            case "response":
                try{
                    if(data){
                        for(var i in data){
                            var recieve_message_json = data[i];
                            if (!recieve_message_json || !recieve_message_json.msg || !recieve_message_json.msg.msgname){
                                window.alert("不明なエラーが発生しました。\nresponse: " + recieve_message_json);
                                cancel();
                                return;
                            }
                            switch(recieve_message_json.msg.msgname){
                                case "started":
                                    recog_flag = true;
                                    uuid = recieve_message_json.msg.uniqueId;
                                    record_flag = true;
                                    var audio_device = navigator.mediaDevices.getUserMedia({video: false, audio: true});
                                    audio_device.then(function(stream){
                                        if(!audio_context){
                                            audio_context = new AudioContext();
                                            if(audio_context.sampleRate != sampling_rate){
                                                audio_context = null;
                                                window.alert("サンプリングレートが一致しません。\nもう一度やり直してください。");
                                                cancel();
                                                return;
                                            }
                                        }
                                        audio_processor = audio_context.createScriptProcessor(buffer_size, 1, 1);
                                        var audio_source = audio_context.createMediaStreamSource(stream);
                                        audio_source.connect(audio_processor);
                                        audio_processor.onaudioprocess = onAudioProcess;
                                        audio_processor.connect(audio_context.destination);
                                    }).catch(function(e){
                                        window.alert("マイク起動エラー\n" + e.message);
                                        cancel();
                                        return;
                                    });
                                    break;
                                case "speechStartDetected":
                                    console.log("speech start detected");
                                    break;
                                case "speechEndDetected":
                                    console.log("speech end detected");
                                    break;
                                case "recognized":
                                    switch(recieve_message_json.result.type){
                                        case 1:
                                        case 2:
                                            if(recieve_message_json.result.sentence && recieve_message_json.result.sentence.length != 0){
                                                console.log("speech is recognized");
                                                var result_text = recieve_message_json.result.sentence[0].surface;
                                                if(result_text.length!=0){
                                                    callback(result_text);
                                                }
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                case "completed":
                                    if(audio_processor){
                                        audio_processor.disconnect();
                                        audio_processor = null;
                                    }
                                    if(audio_context){
                                        audio_context.close();
                                        audio_context = null;
                                    }
                                    recog_flag=false;
                                    stt_worker.postMessage({cmd:"destroy"});
                                    break;
                                default:
                                    break;
                            }
                        }
                        if(recog_flag){
                            send_voice();
                        }
                    }
                    else{
                        send_voice();
                    }
                }
                catch(e){
                    window.alert("ストリーミング音声認識エラー\n" + e.message);
                    cancel();
                    return;
                }
                break;
            case "destroy":
                if(audio_processor){
                    audio_processor.disconnect();
                    audio_processor = null;
                }
                if(audio_context){
                    audio_context.close();
                    audio_context = null;
                }
                break;
            case "error":
                record_flag = false;
                recog_flag = false;
                stt_worker.postMessage({cmd:"destroy"});
                break;
            default :
                break;
        }
    }, false);

    var send_voice = function() {
        var voice_data = null;
        if(cancel_flag){
            cancel();
        }
        else{
            if(audio_buffer_array.length >= chunk_size){
                voice_data = audio_buffer_array.splice(0, chunk_size);
                var short_buffer = audio2int16(voice_data);
                stt_worker.postMessage({cmd:"request", data:short_buffer, uuid:uuid, token:access_token});
            }
            else{
                if(record_flag){
                    stt_worker.postMessage({cmd:"request", data:null, uuid:uuid, token:access_token});
                }
                else{
                    if(audio_buffer_array.length){
                        voice_data = audio_buffer_array;
                        var short_buffer = audio2int16(voice_data);
                        stt_worker.postMessage({cmd:"request", data:short_buffer, uuid:uuid, token:access_token});
                        audio_buffer_array = [];
                    }
                    else{
                        var stop_json = {msg:{msgname:"stop"}};
                        stt_worker.postMessage({cmd:"request", data:JSON.stringify(stop_json), uuid:uuid, token:access_token});
                    }
                }
            }
        }
    };

    var onAudioProcess = function(e) {
        if(record_flag){
            Array.prototype.push.apply(audio_buffer_array, e.inputBuffer.getChannelData(0));
        }
    };

    var cancel = function(){
        try {
            if (audio_processor) {
                audio_processor.disconnect();
                audio_processor = null;
            }
            if(recog_flag){
                var cancel_json = {msg:{msgname:"cancel"}};
                stt_worker.postMessage({cmd:"request", data:JSON.stringify(cancel_json), uuid:uuid, token:access_token});
            }
        }
        catch(e){
            window.alert("音声認識キャンセルエラー\n" + e.message);
        }
    };
}

//認識停止処理
export function stop_stt(){
    record_flag = false;
}

//認識キャンセル処理
export function cancel_stt(){
    cancel_flag = true;
    record_flag = false;
}

//audio bufferをint16配列に変換
function audio2int16(audio_buffer){
    var int_buffer = new Int16Array(audio_buffer.length);
    for (var i=0; i<audio_buffer.length; i++) {
        int_buffer[i] = audio_buffer[i]*0x7FFF;
        if(int_buffer[i] > 0x7FFF){
            int_buffer[i] = 0x7FFF;
        }
        else if(int_buffer[i] < -0x8000){
            int_buffer[i] = -0x8000;
        }
    }
    return int_buffer;
}
const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const app = express();
const { execSync } = require('child_process');
const fs = require('fs');
const axios = require('axios');

const WS_PORT = "Your WS Port";                 // Websocket 서버 포트
const HTTP_PORT = "Your HTTP Port";             // Client 접속 포트
const IMAGE_GENERATION_INTERVAL = 5 * 1000;     // 5 seconds
const phpServerURL = 'Your PHP Server URL';

const wsServer = new WebSocket.Server({ port: WS_PORT }, () => console.log(`WS Server is listening at ${WS_PORT}`));

let lastCheckedDate = new Date();
lastCheckedDate.setHours(0, 0, 0, 0);
let isPosted = false;

// Websokect 서버와 연결된 Client 배열
let connectedClients = [];

let imageDataBuffer = null;     // ESP32-Cam으로부터 받은 이미지 버퍼를 저장하는 변수
let copiedImageData = null;     // imageDataBuffer의 복사본

wsServer.on('connection', (ws, req) => {
    console.log('Connected');

    connectedClients.push(ws);
        
    ws.on('message', data => {
        imageDataBuffer = data;
        connectedClients.forEach((ws, i) => {
            if (ws.readyState === ws.OPEN) {
                ws.send(data);
            } else {
                connectedClients.splice(i, 1);
            }
        })
    });
});

// 두 배열에 같은지 확인하는 함수
function arraysAreEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
}

// IMAGE_GENERATION_INTERVAL초마다 image buffer를 받아오고
// 해당 이미지에서 고양이가 탐지되는지 판단하고 이후 작업을 수행하는 함수
function imageGenInterval() {
    if (imageDataBuffer) {
        // 이전에 복사한 이미지 데이터와 동일한 경우로 ESP32-CAM으로부터 데이터가 안 온다고 판단
        if (copiedImageData != null && arraysAreEqual(copiedImageData, imageDataBuffer)) {
            copiedImageData = null;
            imageDataBuffer = null;
        }
        // 이미지 버퍼에 있는 내용을 복사하고, 고양이 탐지 시작
        else {
            copiedImageData = imageDataBuffer.slice();   // deep copy

            // 현재 위치에 ESP32-cam으로부터 받은 이미지를 가지고 output.jpg 파일을 만든다.
            const fileName = `./output.jpg`;
            fs.writeFileSync(fileName, copiedImageData, 'binary');

            // python command
            const command = `python3 catDetection.py`;

            try {
                // Python script 실행
                const pythonOutput = execSync(command, { encoding: 'utf-8' });

                console.log(pythonOutput);
                let lastNumber = Number(pythonOutput.slice(-2, -1));

                // 고양이가 탐지된 경우
                if (lastNumber > 0) {
                    let imgData = null;

                    const currentDate = new Date();
                    currentDate.setHours(0, 0, 0, 0);

                    // 날짜가 바뀐 경우
                    if (lastCheckedDate < currentDate) {
                        lastCheckedDate = new Date();
                        lastCheckedDate.setHours(0, 0, 0, 0);
                        isPosted = false;
                    }
                    else {
                        // 아직 이미지 데이터를 보내지 못한 경우
                        if (isPosted == false) {
                            console.log("encoding 진행..");
                            // img를 base64로 인코딩
                            imgData = Buffer.from(Uint8Array.from(copiedImageData)).toString('base64')
                            isPosted = true;
                        }
                    }

                    const data = {
                        img: imgData,
                        detected: true
                    }
                    
                    postData(data);
                }
            }
            catch (err) {
                console.error('Error executing Python script:', err);
            }
        }
    }

    setTimeout(imageGenInterval, IMAGE_GENERATION_INTERVAL);
}

// php 서버로 image 데이터, 고양이 탐지 여부를 json 형식으로 보내준다.
function postData(data) {
    axios({
        url: phpServerURL,
        method: "post",
        data: data
    }).then(response => {
        console.log("posted");

        // Ack를 정상적으로 받지 못한 경우 다시 POST하기
        if (!response.data.result) {
            isPosted = false;
        }
    }).catch(error => {
        console.log("post error!");
    });
}

imageGenInterval();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/petMonitor', (req, res) => res.sendFile(path.resolve(__dirname, 'public/client.html')));
app.listen(HTTP_PORT, () => console.log(`HTTP server listening at ${HTTP_PORT}`));

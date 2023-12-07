# ESP32-Cam_WebSocket_Server
ESP32-Cam 이미지를 WebSocket을 통해 클라이언트에 전달하는 Node.js 서버 코드입니다.

### Node.js 환경세팅하기
```
cd ESP-CAM_WebSocket_Server
npm install --save path
npm install --save express
npm install --save ws
```

### OpenCV 라이브러리 받아오기
```
git clone https://github.com/opencv/opencv/
```

### 변수 채우기
1. server.js
   - WS_PORT : Websocket 포트번호
   - HTTP_PORT : Node.js서버에 client가 접속할 포트번호
   - phpServerURL : php서버 url
2. catDetection.py
   - openCV_path : openCV 라이브러리 위치

# ESP32-Cam_WebSocket_Server
ESP32-Cam 이미지를 WebSocket을 통해 클라이언트에 전달하는 Node.js 서버 코드입니다.
본 서버 목적은 ESP32-CAM과 Websocket 통신으로 받은 이미지 데이터를 특정 port로 접속한 client에게 스트리밍 서비스를 제공하는 것입니다.

### Node.js 환경세팅하기
```
cd ESP-CAM_WebSocket_Server
npm install --save path
npm install --save express
npm install --save ws
npm install --save axios
```

### OpenCV 라이브러리 받아오기
```
git clone https://github.com/opencv/opencv/
```

### 새롭게 Define 해야하는 변수 값
1. server.js
```
  WS_PORT : Websocket 포트번호
  HTTP_PORT : Websocket 서버에 client가 접속할 포트번호
  phpServerURL : php서버 url
```

2. public/client.html
```
   WS_IP : Websocket 서버의 IP 주소
   WS_PORT : client가 접속할 Websocket 서버의 포트번호
```
   
3. catDetection.py
```
  openCV_path : openCV 라이브러리 위치
```

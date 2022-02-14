const express = require('express'); // node_module에 다운로드된 express 모듈 가져오기
const app = express(); // 새로운 express app 생성
const path = require('path');
const cors = require('cors')

// request data 처리를 위한 lib
const bodyParser = require('body-parser');

// application/x-www-urlencoded 형식의 데이터 받을 수 있도록 설정
app.use(bodyParser.urlencoded({ extended: true }));

// json 형식 데이터 받을 수 있도록 설정
app.use(bodyParser.json());


// cookie 사용할 때 필요한 lib
const cookieParser = require('cookie-parser');

// 쿠키 파서 사용할 수 있도록 설정, () 빠지면 아무 메시지 없이 서버 응답 없음
app.use(cookieParser());

const config = require('./config/key');

// 몽고DB 연결
const mongoose = require('mongoose');
const connect = mongoose.connect(config.mongoURI, {})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.use(cors())

// api 별 특정 js에서 관리
app.use('/api/user', require('./routes/user'));
app.use('/api/product', require('./routes/product'));

// shop_api/ 에 위치한 디렉터리 내 정적 파일을 request하기 위한 static 설정
app.use('/uploads', express.static('uploads'));

// 운영 서버
if (process.env.NODE_ENV === "production") {

  // React.js 빌드 경로 static 설정
  app.use(express.static("shop_frontend/build"));

  // index.html for all page routes    html or routing and naviagtion
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../shop_frontend", "build", "index.html"));
  });
}

const port = process.env.PORT || 5555 // 백엔드 포트 지정

app.listen(port, () => {
  console.log(`Server Listening on ${port}`)
});
const { User } = require('../models/User'); // 모델 접근

// /api/user/auth 에서 사용하는 middleware
let auth = (req, res, next) => {

    // 실제 인증 처리 로직

    // client cookie에서 token 가져오기
    // token 이름은 로그인 기능에서 x_auth로 넣었기 때문에 x_auth 가져옴
    let token = req.cookies.x_auth;


    // token 복호화 후 user 찾기
    // findByToken 은 model에 구현
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        if(!user) return res.json({isAuth: false, error: true});

        // /api/user/auth 에서 token과 user 정보 사용하기 위해 req에 담기
        req.token = token;
        req.user = user;

        // 미들웨어 옆에있는 콜백함수로 이동
        next();

    })

}

// 다른 파일에서도 쓸 수 있도록 export
module.exports = { auth }
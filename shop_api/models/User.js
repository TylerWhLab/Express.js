const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const jwt = require('jsonwebtoken');
const moment = require("moment");

// 몽구를 이용하여 스키마 생성
const userSchema = mongoose.Schema({
    // 유저와 관련된 필드들
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // email로 입력한 값에 공백 제거
        unique: 1 // 중복 방지
    },
    password: {
        type: String,
        minlength: 4
    },
    // lastname: {
    //     type: String,
    //     maxlength: 50
    // },
    isAdmin: {
        // 관리자, 일반유저 구분용 컬럼
        type: Number,
        default: 0 // 기본값은 0(일반유저)
    },
    cart: {
        type: Array,
        default: []
    },
    history: {
        type: Array,
        default: []
    },
    image: String,
    token: { // 유효성 관리용 컬럼
        type: String
    },
    tokenExp: { // 토큰 유효 기간
        type: Number
    }
})


// https://www.npmjs.com/package/bcrypt
// index.js에서 user.save() 직전에 특정 작업 수행(pw 암호화), 다 끝나면 user.save() 진행
userSchema.pre('save', function(next) {

    var user = this; // 현재 모델

    // pw 암호화
    bcrypt.genSalt(saltRounds, function(err, salt) { // 솔트 생성, salt => 생성된 salt

        if(err) return next(err);

        // password가 변경될 때에만
        if(user.isModified('password')) {

            // plain pw => user.password
            bcrypt.hash(user.password, salt, function(err, hash) { // hash => 암호화된 pw

                if(err) return next(err);

                user.password = hash; // 암호화된 pw로 변경

                // user.save() 로 넘어감
                next()

            });
        } else {
            next();
        }
    });
})


// pw 비교
userSchema.methods.comparePw = function(plainPw, callback) {

    // pw 비교 함수, 콜백으로 match 여부 반환
    bcrypt.compare(plainPw, this.password, function(err, isMatch) { // pw 비교 결과가 isMatch에 담겨 나온다.
        if(err) return callback(err)
        callback(null, isMatch) // 에러 없고, 비밀번호 같다.
    })
}


// gen token
userSchema.methods.genToken = function(callback) {

    var user = this;
    var token = jwt.sign( user._id.toHexString(), 'secretToken' );
    /*
        user._id + 'secretToken' 합쳐서 token 생성
        'secretToken'을 넣으면 user._id 가 튀어나온다.
    */
   
    var oneHour = moment().add(1, 'hour').valueOf();
    user.tokenExp = oneHour;

    // 생성한 토큰을 model에 담기
    user.token = token;

    // 토큰을 model에 담았으니 UPDATE USER SET TOKEN = TOKEN WHERE ID = USER.ID
    user.save(function(err, user) {
        if(err) return callback(err);
        callback(null, user);
    })

}



// cookie에 저장한 token으로 유저 SELECT
userSchema.statics.findByToken = function(token, callback) {
    var user = this;

    // token decode
    jwt.verify(token, 'secretToken', function(err, decodedUserId) {
        // user id로 token 유효성 검사
        user.findOne({ "_id": decodedUserId, "token": token }, function(err, user) {
            if(err) return callbadk(err);
            callback(null, user);
        })
    })

}



// 모델로 스키마 감싸기
const User = mongoose.model('User', userSchema) // (모델이름, 스키마)

module.exports = { User } // 이 모델이 외부에서도 사용할 수 있도록 설정

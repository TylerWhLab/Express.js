const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { Product } = require("../models/Product");
const { Payment } = require("../models/Payment");

const { auth } = require("../middleware/auth");
const async = require('async');

//=================================
//             User
//=================================

router.get("/auth", auth, (req, res) => { // auth라는 미들웨어 : request를 받고, callback 실행 이전에 수행할 작업
    
    // auth에 성공해야만 이후 코드가 실행됨
    console.log("auth 성공");

    res.status(200).json({
        _id: req.user._id, // auth.js에서 req에 user를 담았기 때문에 이렇게 사용
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
        cart: req.user.cart,
        history: req.user.history
    });
});


// 회원가입
router.post("/register", (req, res) => {

    // 회원가입 정보 받기

    // User Model instance 만들기
    // req.body를 json 형태로 구성하기 위해 bodyParser 활용
    // User Model에 request data 넣기
    const user = new User(req.body);

    // save : 몽고DB insert method
    // user Table에 insert
    // doc에는 request로 받아 insert한 data가 들어있음
    user.save((err, doc) => {

        // insert 실패 시 client에 json 형태로 err msg response
        if (err) return res.json({ success: false, err });

        // insert 성공 시 200 OK response, json 형태로 success response
        return res.status(200).json({
            success: true
        });

    });
});


// 로그인
router.post("/login", (req, res) => {

    console.log(req.body.email)
    console.log(req.body.password)

    // SELECT * FROM USER WHERE email = req.body.email;
    User.findOne({ email: req.body.email }, (err, user) => { // user = user model instance 하나
        if (!user)
            return res.json({
                loginSuccess: false,
                message: "존재하지 않는 사용자입니다."
            });

        // pw 비교, User.js Model에 메서드 구현
        user.comparePw(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ loginSuccess: false, message: "존재하지 않는 사용자입니다." });

            /*
                callback은 comparePw() 인자에서 구현, comparePw() 구현코드에서 callback 호출
                comparePw() 구현코드에서 가공한 값을 callback 인자에 넣으면 isMatch 처럼 결과를 인자로 받을 수 있다.
            */

            // 토큰 생성, User.js Model에 메서드 구현
            user.genToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie("x_authExp", user.tokenExp);
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({
                        loginSuccess: true, userId: user._id
                    });
            });
        });
    });
});


// logout : token 삭제
router.get("/logout", auth, (req, res) => { // 로그인 된 상태에서 로그아웃 해야하기 때문에 auth middleware 사용
    User.findOneAndUpdate(
        { _id: req.user._id }, // auth middleware에서 req 에 user를 넣어줌
        { token: "", tokenExp: "" }, 
        (err, doc) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).send({ success: true });
    });
});


router.post("/addToCart", auth, (req, res) => {

    //먼저  User Collection에 해당 유저의 정보를 가져오기 
    User.findOne({ _id: req.user._id },
        (err, userInfo) => {

            // 가져온 정보에서 카트에다 넣으려 하는 상품이 이미 들어 있는지 확인 

            let duplicate = false;
            userInfo.cart.forEach((item) => {
                if (item.id === req.body.productId) {
                    duplicate = true;
                }
            })

            //상품이 이미 있을때
            if (duplicate) {
                User.findOneAndUpdate(
                    { _id: req.user._id, "cart.id": req.body.productId },
                    { $inc: { "cart.$.quantity": 1 } },
                    { new: true },
                    (err, userInfo) => {
                        if (err) return res.status(200).json({ success: false, err })
                        res.status(200).send(userInfo.cart)
                    }
                )
            }
            //상품이 이미 있지 않을때 
            else {
                User.findOneAndUpdate(
                    { _id: req.user._id },
                    {
                        $push: {
                            cart: {
                                id: req.body.productId,
                                quantity: 1,
                                date: Date.now()
                            }
                        }
                    },
                    { new: true },
                    (err, userInfo) => {
                        if (err) return res.status(400).json({ success: false, err })
                        res.status(200).send(userInfo.cart)
                    }
                )
            }
        })
});


router.get('/removeFromCart', auth, (req, res) => {

    //먼저 cart안에 내가 지우려고 한 상품을 지워주기 
    User.findOneAndUpdate(
        { _id: req.user._id },
        {
            "$pull":
                { "cart": { "id": req.query.id } }
        },
        { new: true },
        (err, userInfo) => {
            let cart = userInfo.cart;
            let array = cart.map(item => {
                return item.id
            })

            //product collection에서  현재 남아있는 상품들의 정보를 가져오기 

            //productIds = ['5e8961794be6d81ce2b94752', '5e8960d721e2ca1cb3e30de4'] 이런식으로 바꿔주기
            Product.find({ _id: { $in: array } })
                .populate('writer')
                .exec((err, productInfo) => {
                    return res.status(200).json({
                        productInfo,
                        cart
                    })
                })
        }
    )
})



router.post('/successBuy', auth, (req, res) => {


    //1. User Collection 안에  History 필드 안에  간단한 결제 정보 넣어주기
    let history = [];
    let transactionData = {};

    req.body.cartDetail.forEach((item) => {
        history.push({
            dateOfPurchase: Date.now(),
            name: item.title,
            id: item._id,
            price: item.price,
            quantity: item.quantity,
            paymentId: req.body.paymentData.paymentID
        })
    })

    //2. Payment Collection 안에  자세한 결제 정보들 넣어주기 
    transactionData.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
    }

    transactionData.data = req.body.paymentData
    transactionData.product = history

    //history 정보 저장 
    User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { history: history }, $set: { cart: [] } },
        { new: true },
        (err, user) => {
            if (err) return res.json({ success: false, err })


            //payment에다가  transactionData정보 저장 
            const payment = new Payment(transactionData)
            payment.save((err, doc) => {
                if (err) return res.json({ success: false, err })


                //3. Product Collection 안에 있는 sold 필드 정보 업데이트 시켜주기 


                //상품 당 몇개의 quantity를 샀는지 

                let products = [];
                doc.product.forEach(item => {
                    products.push({ id: item.id, quantity: item.quantity })
                })


                async.eachSeries(products, (item, callback) => {

                    Product.update(
                        { _id: item.id },
                        {
                            $inc: {
                                "sold": item.quantity
                            }
                        },
                        { new: false },
                        callback
                    )
                }, (err) => {
                    if (err) return res.status(400).json({ success: false, err })
                    res.status(200).json({
                        success: true,
                        cart: user.cart,
                        cartDetail: []
                    })
                }
                )
            })
        }
    )
})



module.exports = router;

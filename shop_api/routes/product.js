const express = require('express');
const router = express.Router(); // express에서 제공하는 router : api 별로 js 파일 관리
const multer = require('multer'); // 파일 업로드 lib https://www.npmjs.com/package/multer
const { Product } = require("../models/Product");

//=================================
//             Product
//=================================

// Start 파일 업로드
// multer : 파일 업로드 용 lib https://www.npmjs.com/package/multer
var storage = multer.diskStorage({

    // 파일을 저장할 경로
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // shop_api/uploads/ 에 저장
    },

    // 저장할 파일명
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`) // 시간+파일명으로 저장
    }

})

var upload = multer({ storage: storage }).single("file")

router.post('/image', (req, res) => {

    // 이미지 저장
    upload(req, res, err => {
        if (err) {
            return res.json({ success: false, err })
        }
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename })
    })

})
// End 파일 업로드


// /api/product/
// 상품 등록
router.post('/', (req, res) => {

    // request를 product model에 담기
    const product = new Product(req.body)

    // INSERT INTO
    product.save((err) => {
        if (err) return res.status(400).json({ success: false, err })
        return res.status(200).json({ success: true })
    })

})


// /api/product/products
// 상품 SELECT
router.post('/products', (req, res) => {


    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    // product collection에 들어 있는 모든 상품 정보를 가져오기 
    let limit = req.body.limit ? parseInt(req.body.limit) : 20; // 한 번에 20개
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;
    let term = req.body.searchTerm

    let findArgs = {};

    // 체크박스, 라디오버튼 검색
    for (let key in req.body.filters) { // key는 대륙 또는 가격
        if (req.body.filters[key].length > 0) { // 대륙 또는 가격에 선택된게 있다면

            console.log('key', key)

            if (key === "price") {
                findArgs[key] = {
                    // Greater than equal
                    $gte: req.body.filters[key][0], // MongoDB 문법, Price는 [0, 199]과 같이 배열로 받기 때문에 0 <= x <= 199 으로 검색
                    // Less than equal
                    $lte: req.body.filters[key][1]
                }
            } else {
                findArgs[key] = req.body.filters[key];
            }

        }
    }

    // String 검색
    if (term) {
        // SELECT *
        Product.find(findArgs)
            .find({ $text: { $search: term } }) // 모든 data collection에서 term을 찾음(model에서 컬럼별 weight를 다르게 줄 수 있음)
            .populate("writer") // writer의 product만 SELECT
            .sort([[sortBy, order]])
            .skip(skip) // 현재 페이지
            .limit(limit) // 한 번에 가져올 개수
            .exec((err, productInfo) => { // .exec : 쿼리 실행, productInfo : 쿼리 결과
                if (err) return res.status(400).json({ success: false, err })
                return res.status(200).json({
                    success: true, productInfo,
                    postSize: productInfo.length
                })
            })
    } else {
        Product.find(findArgs)
            .populate("writer")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, productInfo) => {
                if (err) return res.status(400).json({ success: false, err })
                return res.status(200).json({
                    success: true, productInfo,
                    postSize: productInfo.length
                })
            })
    }

})


//id=123123123,324234234,324234234  type=array
router.get('/products_by_id', (req, res) => {

    let type = req.query.type
    let productIds = req.query.id

    if (type === "array") {
        //id=123123123,324234234,324234234 이거를 
        //productIds = ['123123123', '324234234', '324234234'] 이런식으로 바꿔주기
        let ids = req.query.id.split(',')
        productIds = ids.map(item => {
            return item
        })

    }

    //productId를 이용해서 DB에서  productId와 같은 상품의 정보를 가져온다.

    Product.find({ _id: { $in: productIds } })
        .populate('writer')
        .exec((err, product) => {
            if (err) return res.status(400).send(err)
            return res.status(200).send(product)
        })

})






module.exports = router;

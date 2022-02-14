// 상품 정보 DB에 저장

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = mongoose.Schema({
    writer: {
        type: Schema.Types.ObjectId, // ref model에 속한 _id
        ref: 'User' // Schema.Types.ObjectId(key)가 속한 model, 따라서 User model에 있는 _id를 가리킴(=로그인한 사람의 _id)
    },
    title: {
        type: String,
        maxlength: 50
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        default: 0
    },
    images: {
        type: Array,
        default: [] // array
    },
    sold: {
        type: Number,
        maxlength: 100,
        default: 0
    },

    continents: {
        type: Number,
        default: 1
    },

    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true }) // 현재시간 자동 등록


// String 검색 우선 순위 정하기
productSchema.index({
    // 아래 2 컬럼에 검색이 적용되도록 설정
    title: 'text',
    description: 'text'
}, {
    weights: {
        // title을 더 중요하게 고려하여 검색
        title: 5,
        description: 1
    }
})


const Product = mongoose.model('Product', productSchema);

module.exports = { Product }
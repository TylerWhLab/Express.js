import React, { useEffect, useState } from 'react'
// import { FaCode } from "react-icons/fa";
import axios from "axios";
import { Col, Card, Row } from 'antd';
import Icon from '@ant-design/icons';
import Meta from 'antd/lib/card/Meta';
import ImageSlider from '../../utils/ImageSlider';
import Checkbox from './Sections/CheckBox';
import Radiobox from './Sections/RadioBox';
import SearchFeature from './Sections/SearchFeature';
import { continents, price } from './Sections/Datas';

function LandingPage() {

    // state
    const [Products, setProducts] = useState([])
    const [Skip, setSkip] = useState(0)
    const [Limit, setLimit] = useState(8)
    const [PostSize, setPostSize] = useState(0)
    const [Filters, setFilters] = useState({
        continents: [],
        price: []
    })
    const [SearchTerm, setSearchTerm] = useState("")

    // 현재 페이지에 들어오자 마자 실행할 내용 => useEffect에 작성
    useEffect(() => {

        let body = {
            skip: Skip, // 페이지 번호
            limit: Limit // 한 페이지에 출력할 개수
        }

        getProducts(body)

    }, [])

    // SELECT * FROM PRODUCT WHERE = WRITER;
    const getProducts = (body) => {
        axios.post('/api/product/products', body)
            .then(response => {
                if (response.data.success) {

                    // 더보기 클릭 했을 땐, 기존 목록에 더하기
                    if (body.loadMore) {
                        setProducts([...Products, ...response.data.productInfo])
                    } else {
                        setProducts(response.data.productInfo)
                    }
                    setPostSize(response.data.postSize)
                } else {
                    alert('상품들을 가져오는데 실패 했습니다.');
                }
            })
    }



    // 더보기 버튼 클릭 이벤트
    const loadMoreHanlder = () => {

        let skip = Skip + Limit // 다음 페이지 (Limit)개 SELECT
        let body = {
            skip: skip,
            limit: Limit,
            loadMore: true,
            filters: Filters
        }

        getProducts(body)
        setSkip(skip)
    }


    // 상품 하나가 card, 상품 목록에 각각 이미지 뿌리기
    const renderCards = Products.map((product, index) => {

        // 1줄에 4개 출력
        // 1row = 24, lg=6 이면 1줄에 4개 들어감, 화면이 조금 줄어들면 1줄에 3개(md=8), 작으면 1개가 24 차지(xs=24)
        return <Col lg={6} md={8} xs={24} key={index}>
            <Card
                cover={<a href={`/product/${product._id}`} ><ImageSlider images={product.images} /></a>}
                // ImageSlider.js 에 images를 넣어주는데, props로 접근할 수 있음
            >
                <Meta
                    title={product.title}
                    description={`$${product.price}`}
                />
            </Card>
        </Col>
    })





    // 라디오 버튼
    const handlePrice = (value) => {
        const data = price;
        let array = [];

        for (let key in data) {
            if (data[key]._id === parseInt(value, 10)) { // 선택한 라디오버튼의 값을 Datas.js 내 배열로 바꾸기
                array = data[key].array;
            }
        }
        return array;
    }

    // 자식 컴포넌트 RadioBox.js, CheckBox.js로부터 값 받기
    const handleFilters = (filters, category) => {

        const newFilters = { ...Filters }

        newFilters[category] = filters

        console.log('filters', filters)

        if (category === "price") {
            let priceValues = handlePrice(filters)
            newFilters[category] = priceValues
        }
        showFilteredResults(newFilters) // 검색
        setFilters(newFilters) // 선택값 set
    }


    // 체크 박스 선택 시 검색
    const showFilteredResults = (filters) => {

        let body = {
            skip: 0,
            limit: Limit,
            filters: filters
        }

        getProducts(body)
        setSkip(0)
    }


    // String 검색
    const updateSearchTerm = (newSearchTerm) => {

        let body = {
            skip: 0,
            limit: Limit,
            filters: Filters, // 체크박스, 라디오박스까지 함께 검색
            searchTerm: newSearchTerm
        }

        setSkip(0)
        setSearchTerm(newSearchTerm)
        getProducts(body)

    }


    // 상품 목록 화면
    return (
        <div style={{ width: '75%', margin: '3rem auto' }}>

            <div style={{ textAlign: 'center' }}>
                <h2>김정균 쇼핑몰 <Icon type="rocket" /> </h2>
            </div>


            {/* 검색 Filter */}
            <Row gutter={[16, 16]}>
                
                <Col lg={12} xs={24}>
                    {/* Sections/CheckBox.js */}
                    <Checkbox list={continents} handleFilters={filters => handleFilters(filters, "continents")} />
                    {/* handleFilters 통해 Sections/CheckBox.js 값 가져오기 */}
                </Col>

                <Col lg={12} xs={24}>
                    {/* Sections/RadioBox.js */}
                    <Radiobox list={price} handleFilters={filters => handleFilters(filters, "price")} />
                </Col>

            </Row>





            {/* String Search */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem auto' }}>
                {/* 우측 정렬 */}
                <SearchFeature
                    refreshFunction={updateSearchTerm}
                    // SearchFeature.js에서 받은 값을 updateSearchTerm()으로 전달
                />
            </div>



            {/* Cards */}
            <Row gutter={[16, 16]} >
                {/* gutter 로 여백 넣기 */}
                {renderCards}
            </Row>




            <br />


            {/* 더보기 버튼, 더 표시할 내용이 있는지 size로 체크 */}
            {PostSize >= Limit &&
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={loadMoreHanlder}>더보기</button>
                </div>
            }

        </div>
    )
}

export default LandingPage

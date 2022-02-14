import React, { useState } from 'react'
import { Input } from 'antd';

const { Search } = Input;

function SearchFeature(props) {

    const [SearchTerm, setSearchTerm] = useState("")

    const searchHandler = (event) => {
        setSearchTerm(event.currentTarget.value) // 입력값 state에 넣기
        props.refreshFunction(event.currentTarget.value) // 부모 컴포넌트로 전달
    }

    return (
        <div>
            <Search
                placeholder="상품명..."
                onChange={searchHandler}
                style={{ width: 200 }}
                value={SearchTerm}
            />
        </div>
    )
}

export default SearchFeature

import React, { useState } from 'react'
import { Collapse, Radio } from 'antd';

const { Panel } = Collapse;


function RadioBox(props) {

    const [Value, setValue] = useState(0)


    // 라디오 박스 data 개수만큼 렌더링
    const renderRadioBox = () => (
        props.list && props.list.map(value => (
            <Radio key={value._id} value={value._id}> {value.name} </Radio>
        ))
    )

    const handleChange = (event) => {
        setValue(event.target.value) // 선택한 라디오 버튼 value를 state에 set
        props.handleFilters(event.target.value) // 부모 컴포넌트(LandingPage.js)로 값 전달
    }

    return (
        <div>
            <Collapse defaultActiveKey={['0']} >
                <Panel header="가격" key="1">

                    <Radio.Group onChange={handleChange} value={Value}>
                        {renderRadioBox()}
                    </Radio.Group>

                </Panel>
            </Collapse>
        </div>
    )
}

export default RadioBox

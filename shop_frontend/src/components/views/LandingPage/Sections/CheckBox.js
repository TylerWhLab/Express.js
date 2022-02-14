import React, { useState } from 'react'
import { Collapse, Checkbox } from 'antd';

const { Panel } = Collapse;

function CheckBox(props) {

    const [Checked, setChecked] = useState([])

    // 체크 박스 on/off
    const handleToggle = (value) => {
        // 체크박스에서 선택한 Index
        const currentIndex = Checked.indexOf(value)

        const newChecked = [...Checked]

        // 선택한게 없으면
        if (currentIndex === -1) {
            newChecked.push(value)
        // 선택한게 있으면
        } else {
            newChecked.splice(currentIndex, 1)
        }
        setChecked(newChecked)
        props.handleFilters(newChecked) // 부모 컴포넌트(LandingPage.js)에 state 전송
    }



    const renderCheckboxLists = () => props.list && props.list.map((value, index) => (
        <React.Fragment key={index} >
            <Checkbox onChange={() => handleToggle(value._id)}
                checked={Checked.indexOf(value._id) === -1 ? false : true} />
            <span>{value.name}</span>
        </React.Fragment>
    ))

    return (
        <div>
            <Collapse defaultActiveKey={['0']} >
                <Panel header="지역" key="1">

                    {renderCheckboxLists()}

                </Panel>
            </Collapse>
        </div>
    )
}

export default CheckBox

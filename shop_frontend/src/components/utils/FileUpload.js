// 파일 업로드 화면을 별도 컴포넌트로 뺀 것

import React, { useState } from 'react'
import Dropzone from 'react-dropzone'
import Icon from '@ant-design/icons'; // + 모양 버튼
import axios from 'axios';


function FileUpload(props) {

    const [Images, setImages] = useState([]) // [] array로 만들어 이미지 다수 저장

    // 이미지를 올렸을 때
    const dropHandler = (files) => {

        // 이미지 멀티파트로 전송
        let formData = new FormData();
        const config = {
            header: { 'content-type': 'multipart/fomr-data' }
        }
        formData.append("file", files[0])

        // 서버로 이미지 전송
        axios.post('/api/product/image', formData, config)
            .then(response => {
                if (response.data.success) {
                    setImages([...Images, response.data.filePath])
                    // ...Images : 기존 state에 저장된 모든 data
                    // response.data.filePath : 신규 추가한 이미지
                    // 이 둘을 합쳐 image state에 저장

                    // 상위 컴포넌트로 이미지들 전송
                    props.refreshFunction([...Images, response.data.filePath])
                } else {
                    console.log(response)
                    alert('파일을 저장하는데 실패했습니다.')
                }
            })
    }

    // 이미지 클릭하여 삭제
    // index 활용
    const deleteHandler = (image) => {
        const currentIndex = Images.indexOf(image); // 선택한 이미지의 index
        let newImages = [...Images]
        newImages.splice(currentIndex, 1) // 선택한 이미지부터 1개 삭제 == 선택 이미지 삭제
        setImages(newImages) // 지운 이미지 제외하고 state에 저장
        
        // 상위 컴포넌트로 이미지들 전송
        props.refreshFunction(newImages)
    }

    // 업로드 화면
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>

            {/* 드랍존 */}
            <Dropzone onDrop={dropHandler}>
                {({ getRootProps, getInputProps }) => (
                    <div
                        style={{
                            width: 300, height: 240, border: '1px solid lightgray',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        {...getRootProps()}>
                        <input {...getInputProps()} />

                        {/* + 버튼 antd */}
                        <Icon type="plus" style={{ fontSize: '3rem' }} />
                    </div>
                )}
            </Dropzone>

            {/* 업로드 이미지 출력 */}
            <div style={{ display: 'flex', width: '350px', height: '240px', overflowX: 'scroll' }}>

                {Images.map((image, index) => (
                    <div onClick={() => deleteHandler(image)} key={index}>
                        <img style={{ minWidth: '300px', width: '300px', height: '240px' }}
                            src={`http://localhost:5555/${image}`}
                        />
                    </div>
                ))}

            </div>


        </div>
    )
}

export default FileUpload

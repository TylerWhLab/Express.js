import React from 'react'
import { Carousel } from 'antd';

// 이미지 자동(autoplay)으로 슬라이드
function ImageSlider(props) { // props : LandingPage.js에서 넣어준 images
    return (
        <div>
            <Carousel autoplay >
                {props.images.map((image, index) => (
                    <div key={index}>
                        <img style={{ width: '100%', maxHeight: '150px' }}
                            src={`http://localhost:5555/${image}`} />
                    </div>
                ))}
            </Carousel>
        </div>
    )
}

export default ImageSlider

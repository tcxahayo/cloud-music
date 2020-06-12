import React, { useState, useEffect } from 'react';
import { isEmpty } from '../../api/util';
import Swiper from 'swiper';
import "swiper/css/swiper.css";
import { SliderContainer } from './style';

function Slider(props) {
    const [exist, setExist] = useState(null);
    const { bannerList } = props;
    useEffect(() => {
        if (!isEmpty(bannerList) && isEmpty(exist)) {
            let newSliderSwiper = new Swiper(".slider-container", {
                loop: true,
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                //分页小圆点
                pagination: {
                    el:'.swiper-pagination'
                }
            });
            setExist('newSliderSwiper')
        }
    },[bannerList,exist])

    return (
        <SliderContainer>
            <div className='slider-container'>
                <div className='swiper-wrapper'>
                    {
                        bannerList.map((item,index) => {
                            return (
                            <div className='swiper-slide' key={index}>
                                <div className='slider-nav'>
                                    <img src={item.imageUrl} width="100%" height="100%" alt='推荐' />
                                </div>
                            </div>
                            )
                        })
                    }
                </div>
                <div className='swiper-pagination'></div>
            </div>
            <div className='before'></div>
        </SliderContainer>
    )
}
export default React.memo(Slider);
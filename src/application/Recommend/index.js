import React, { useEffect } from 'react';
import Slider from '@/components/slider';
import RecommendList from '@/components/recommendList/index';
import { Content } from './style';
import Scroll from '@/baseUI/scroll';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from './store/actionCreators';
import { forceCheck } from 'react-lazyload';

function Recommend(props) {
    //使用useSelector， useDispatch连接redux，就不用使用mapDispatchToProps和mapStateToProps
    const dispatch = useDispatch();
    const bannerList = useSelector(state => state.getIn(['recommend', 'bannerList']));
    const recommendList = useSelector(state => state.getIn(['recommend', 'recommendList']));
    useEffect(() => {
        dispatch(actionTypes.getBannerList());
        dispatch(actionTypes.getRecommendList());
    }, []);
    console.log(111)
    const bannerListJS = bannerList ? bannerList.toJS() : [];
    const recommendListJS = recommendList ? recommendList.toJS() : [];
    return (
        <Content>
            <Scroll className="list" onScroll={forceCheck}>
                <div>
                    <Slider bannerList={bannerListJS} />
                    <RecommendList recommendList={recommendListJS} />
                </div>
            </Scroll>
        </Content>
    )
}

export default React.memo(Recommend);
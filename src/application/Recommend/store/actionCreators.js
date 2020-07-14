import * as actionTypes from './constants';
import { fromJS } from 'immutable';// 将 JS 对象转换成 immutable 对象
import { getBannerRequest, getRecommendListRequest} from '../request';
//banner
export const changeBannerList = (data)=>({
    type: actionTypes.CHANGE_BANNER,
    data: fromJS(data)
});
//推荐列表
export const changeRecommendList = (data)=>({
    type: actionTypes.CHANGE_RECOMMEND_LIST,
    data: fromJS(data)
});
//获取banner的接口
export const getBannerList =()=>{
    return (dispatch)=>{
        getBannerRequest().then((res)=>{
            dispatch(changeBannerList(res.banners))
        }).catch(()=>{
            console.log('banner请求出错')
        })
    }
};
//获取推荐列表的接口
export const getRecommendList =()=>{
    return (dispatch)=>{
        getRecommendListRequest().then((res)=>{
            dispatch(changeRecommendList(res.result));
        }).catch(()=>{
            console.log('请求推荐列表出错');
        })
    }
};

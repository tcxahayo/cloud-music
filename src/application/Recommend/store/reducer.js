import * as actionTypes from './constants';
import { fromJS } from 'immutable';// 这里用到 fromJS 把 JS 数据结构转化成 immutable 数据结构

const defaultState = fromJS({
    bannerList: [],
    recommendList: [],
});

export default (state = defaultState, action)=>{
    switch (action.type){
        case actionTypes.CHANGE_BANNER:
            //state被immutable数据结构了，所以可以使用set去改变值，其他方法改变不了
            return  state.set('bannerList', action.data);
        case actionTypes.CHANGE_RECOMMEND_LIST:
            return state.set('recommendList', action.data)
        default:
            return state;
    }
}
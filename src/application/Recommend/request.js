import { axiosInstance } from '@/api/config';

//首页banner调用
export const getBannerRequest =()=>{
    return axiosInstance.get('/banner');
}

//推荐歌单
export const getRecommendListRequest =()=>{
    return axiosInstance.get('/personalized')
}
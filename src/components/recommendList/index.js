import React from 'react';
import { ListWapper, List, ListItem } from './style';
import { getCount } from '@/api/util';
import LazyLoad from 'react-lazyload';
import imgURL from '@/assets/img/miao.jpeg';


function RecommendList(props) {
    return (
        <ListWapper>
            <h1 className='title'>推荐歌单</h1>
            <List>
                {
                    props.recommendList.map((item, index) => {
                        return (
                            <ListItem key={item.id}>
                                <div className='img_wrapper'>
                                    <div className='decorate'></div>
                                    {/* 加此参数可以减小请求的图片资源大小 */}
                                    <LazyLoad placeholder={<img width="100%" height="100%" src={imgURL} alt='miao' />}>
                                        <img src={item.picUrl + "?param=300x300"} width="100%" height="100%" alt='music' />
                                    </LazyLoad>
                                    <div className='play_count'>
                                        <i className='iconfont play'></i>
                                        <span className='count'>{getCount(item.playCount)}</span>
                                    </div>
                                </div>
                                <div className='desc'>{item.name}</div>
                            </ListItem>
                        )
                    })
                }
            </List>
        </ListWapper>
    )
}
export default React.memo(RecommendList);
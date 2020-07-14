import React, { forwardRef, useState, useRef, useEffect, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import BScroll from 'better-scroll';
import styled from 'styled-components';


//样式
const ScrollContainer = styled.div`
    width: 100%;
    height: 100%;
    overflow: hidden;
`
const Scroll = forwardRef((props, ref) => {
    const { direction, click, refresh, pullUpLoading, pullDownLoading, bounceTop, bounceBottom } = props;
    const { onSrcoll, pullUp, pullDown } = props;
    //better-scroll 实例对象 
    const [bScroll, setBScroll] = useState();
    //current 指向初始化 bs 实例需要的DOM元素
    const srcollContaninerRef = useRef();
    useEffect(() => {
        // 初始化better-scroll实例
        const scroll = new BScroll(srcollContaninerRef.current, {
            scrollX: direction === 'horizental',
            scrollY: direction === 'vertical',
            probeType: 3,
            bounce: {
                top: bounceTop,
                bottom: bounceBottom
            }
        });
        setBScroll(scroll);
        //注销页面的时候，销毁这个滚动
        return () => {
            setBScroll(null);
        }
    }, []);
    //刷新实例，防止他无法滑动
    useEffect(() => {
        if (refresh && bScroll) {
            bScroll.refresh();
        }
    });
    //给实例绑定scroll事件
    useEffect(() => {
        if (!onSrcoll || !bScroll) return;
        bScroll.on('scroll', (scroll) => {
            onSrcoll(scroll);
        })
        //销毁解绑
        return () => {
            bScroll.off('scroll');
        }
    }, [onSrcoll, bScroll]);
    //上拉到顶，在加载更多,绑定滑动到底部事件
    useEffect(() => {
        if (!pullUp || !bScroll) return;
        bScroll.on('srcollEnd', () => {
            //判断是否触底了，触底就加载更多
            if (bScroll.y <= bScroll.maxScrollY + 100) {
                pullUp();
            }
        })
        //销毁解绑
        return () => {
            bScroll.off('srcollEnd');
        }
    }, [pullUp, bScroll])
    //下拉刷新
    useEffect(() => {
        if (!pullDown || !bScroll) return;
        bScroll.on('touchEnd', (pos) => {
            //判断用户下拉的动作
            if (pos.y > 50) {
                pullDown();
            }
        });
        //销毁解绑
        return () => {
            bScroll.off('touchEnd');
        }
    }, [pullDown, bScroll]);
    //使用自定义ref的时候，暴露给父组件的实例值
    useImperativeHandle(ref, ()=>({
        //暴露给外界的refresh的方法
        refresh(){
            if(bScroll){
                bScroll.refresh();
                bScroll.scrollTo(0, 0);
            }
        },
        //暴露的getBScroll方法，提供bs实例
        getBScroll(){
            if(bScroll){
                return bScroll;
            }
        }
    }));

    return (
        <ScrollContainer ref={srcollContaninerRef}>
            {props.children}
        </ScrollContainer>
    );
})

export default Scroll;
//PropTypes, 类型检查
Scroll.propTypes = {
    direction: PropTypes.oneOf(['vertical', 'horizental']), //滚动的方向
    click: true, //是否支持点击
    refresh: PropTypes.bool, //是否刷新
    onSrcoll: PropTypes.func, //滑动触发的回调函数
    pullUp: PropTypes.func, //上拉加载的逻辑
    pullDown: PropTypes.func, //下拉加载的逻辑
    pullUpLoading: PropTypes.bool, //是否显示上拉loading动画
    pullDownLoading: PropTypes.bool, //是否显示下拉loading动画
    bounceTop: PropTypes.bool, //是否支持向上吸顶
    bounceBottom: PropTypes.bool // 是否支持向下吸底
}
//默认赋值
Scroll.defaultProps = {
    direction: "vertical",
    click: true,
    refresh: true,
    onSrcoll: null,
    pullUp: null,
    pullDown: null,
    pullUpLoading: false,
    pullDownLoading: false,
    bounceTop: true,
    bounceBottom: true
}
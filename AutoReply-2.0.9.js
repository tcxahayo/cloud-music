;
if (window.LoveSeller == undefined || window.LoveSeller == null) {
    window.LoveSeller = navigator.LoveSeller = {};
    (function(LoveSeller) {
        var socketURL = 'ws://localhost:1234';
        var inportQNHeads = ['https://g.alicdn.com/sj/lib/jquery/dist/jquery.min.js?qntag=11',
            'https://g.alicdn.com/sj/qn/jssdk.js?qntag=3',
            'https://g.alicdn.com/secdev/entry/index.js?t=213757" id="aplus-sufei',
            'https://g.alicdn.com/alilog/oneplus/entry.js?t=213757'
        ];

        function initPushMessage() {
            for (var i = inportQNHeads.length - 1; i >= 0; i--) {
                var jquery = document.createElement('script');
                jquery.src = inportQNHeads[i];
                document.getElementsByTagName('head')[0].appendChild(jquery);
            }

            setTimeout(function() {
                QN.event.unregEvent({
                    eventId: "wangwang.recvU2UMsgBatch",
                    success: function() {
                        Invoke.addMsgListener("eventId", "wangwang.recvU2UMsgBatch");
                    },
                    error: function() {
                        Invoke.addMsgListener("eventId", "wangwang.recvU2UMsgBatch");
                    }
                });

            }, 1000);
            WSConnect.startWebSocket();
        };
        var WSConnect = {
            ws: null,
            startWebSocket: function() {
                ws = new WebSocket(socketURL);
                this.ws = ws;
                ws.onopen = function() {
                    ws.send(JSON.stringify({ "act": "connect", 'usernick': window.ayUserNick }));
                };
                ws.onmessage = function(evt) {
                    var received_msg = evt.data;
                    setTimeout(function() {
                        evalStr = decodeURIComponent(received_msg);
                        Invoke.procressMessage(evalStr);
                    }, 200);
                };
                ws.onclose = function() {
                    ws = null;
                    ws = new WebSocket(socketURL);
                };
            },
            sendMessage: function(message) {
                ws.send(message);
            },
            disconnect: function() {
                ws.send("{req:0}");
                ws.close();
            }
        };
        var Invoke = {
            procressMessage: function(message) {
                var messageObj = JSON.parse(message);
                if (messageObj != null && messageObj != undefined) {
                    var cmd = messageObj["cmd"];
                    if (cmd === "transferContact") {
                        Invoke.transferContact(messageObj['custom'], messageObj['server']);
                    } else if (cmd === "batchTransfer") {
                        Invoke.batchTransfer(JSON.parse(messageObj['servers']), 0);
                    } else if (cmd === "sendBatchMsg") {
                        Invoke.qnBatchSendMessage(messageObj);
                    }
                }
            },

            qnBatchSendMessage: function(messageObj) {
                var msgType = messageObj["type"];
                var msgNode = messageObj["msgnode"];
                var ifClick = messageObj["autosend"];
                var invokeArgus = {};
                invokeArgus['cmd'] = msgType;
                invokeArgus['param'] = msgNode;
                invokeArgus["success"] = function() {
                    var exact = null;
                    if (msgType === "insertText2Inputbox") {
                        if (ifClick) {
                            exact = "click";
                        } else {
                            exact = "open";
                        }
                    }
                    WSConnect.sendMessage(Invoke.__makeBatchMsgResult__("", true, exact));
                };
                invokeArgus["error"] = function(msg) {
                    WSConnect.sendMessage(Invoke.__makeBatchMsgResult__("", false, null, msg));
                }
                QN.application.invoke(invokeArgus);
            },
            transferContact: function(customNick, serverNick) {
                console.log('asdf');
                var state = { "act": "transformres" };
                QN.wangwang.invoke({
                    cmd: "transferContact",
                    param: {
                        contactID: Invoke.correctNick(customNick),
                        targetID: Invoke.correctNick(serverNick)
                    },
                    success: function() {
                        console.log('sucess');
                    },
                    error: function(e) {
                        console.log('error' + JSON.stringify(e));
                    }
                })
            },
            clearAutoReplyList:function(){
                // 获取当前时间，
                // 
                var date = new Date();
                var hour = date.getHours();
                var minutes = date.getMinutes();
                if ((hour == 9 || hour == 13) && minutes == 10) {
                    if(window.__TransferContacts_.length > 50){
                        window.__TransferContacts_ = [];
                    }
                    if (window.__TransferFreeVersion_.length > 10) {
                        window.__TransferFreeVersion_ = [];
                    }
                }
            },
            addMsgListener: function(tag, tagValue) {
                var param = {
                    success: function() {},
                    error: function(msg) {},
                    notify: function (data) {
                        var jsonobj = JSON.parse(data)[0]
                        console.log(data);
                        var msgcont = jsonobj.message;
                        var bIsReply = false;
                        Invoke.clearAutoReplyList();
                        var askSellernick = jsonobj['fromuid'].replace(/cntaobao/, "");
                        $.getJSON("https://mcs.aiyongtech.com/1.gif?p=TD20200706110701&e=AD_EV_ROB_RECEIVE&m2=" + askSellernick + "&m1=" + window.ayUserNick, function (data) { });

                        setTimeout(function () {
                            var isAutoReplayed = false;
                            var freeRenewal = false;

                            // 判断话术统一函数
                            const calcWords = (message) => {
                                if (msgcont.indexOf(message) > -1) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                            // 机器人回复事件
                            const replyMessage = (message) => {
                                bIsReply = true;
                                Invoke.qnSendMessage(jsonobj['fromuid'], message);
                            }
                            // 内容判断和回复
                            // ios 订购自动回复
                            if (Invoke.dutyTime() && window.ayUserNick == '爱用科技:淘子悟') {
                                QN.wangwang.invoke({
                                    cmd: "insertText2Inputbox",
                                    param: {
                                        uid: jsonobj['fromuid'],
                                        text: ' ',
                                        type: 1
                                    }
                                });
                            }

                            if (calcWords("我是ios用户")) {
                                if (calcWords('想使用爱用交易')) {
                                    isAutoReplayed = true;
                                    replyMessage('爱用交易高级版：自动评价、差评拦截、短信关怀、打单发货。自定义导入外部平台订单（1688、天猫淘宝、等）。自动评价在买家评价后立即评价提高店铺信誉、DSR动态评分。新增：绑定店铺,,一键打印订单哦\r亲爱的，遇见有用的东西就把它买下来，钱并不是真的花掉了，只是换一种方式陪伴在您身边为您创造更多的价值~该花的钱省不得，软件一季度52元，合算下来一天5毛钱多一点。买它！\r\r苹果手机用户尊享——爱用交易高级版订购链接\r52元/季度：http://b.mashort.cn/B.2Nzni\r99元/半年：http://b.mashort.cn/B.2mGs8\r138元/年：http://b.mashort.cn/B.2jMM6');
                                } else if (calcWords('想使用爱用商品')) {
                                    isAutoReplayed = true;
                                    replyMessage('爱用商品高级版：自动上下架，全店生成手详，标题优化，关联销售，主图视频，主图水印，批量修改、复制宝贝，违规词检测、促销打折、拼团拍卖等，据用户反馈说，拼团拍卖对拉新效果很不错的呢！\r亲爱的，遇见有用的东西就把它买下来，钱并不是真的花掉了，只是换一种方式陪伴在您身边为您创造更多的价值~该花的钱省不得，软件一季度52元，合算下来一天5毛钱多一点。买它！\r\r苹果手机用户尊享——爱用商品高级版订购链接..\r52元/季度：http://b.mashort.cn/B.29QbE\r95元/半年：http://b.mashort.cn/B.28hmQ\r138元/年：http://b.mashort.cn/B.2j3n1');
                                }
                            }

                            if (calcWords('我想使用爱用交易高级功能')) {
                                isAutoReplayed = true;
                                replyMessage('爱用交易高级版：自动评价、差评拦截、短信关怀、打单发货。自定义导入外部平台订单（1688、天猫淘宝、等）。自动评价在买家评价后立即评价提高店铺信誉、DSR动态评分。新增：绑定店铺,,一键打印订单哦\r亲爱的，遇见有用的东西就把它买下来，钱并不是真的花掉了，只是换一种方式陪伴在您身边为您创造更多的价值~该花的钱省不得，软件一季度52元，合算下来一天5毛钱多一点。买它！\r\r苹果手机用户尊享——爱用交易高级版订购链接\r52元/季度：http://b.mashort.cn/B.2Nzni\r99元/半年：http://b.mashort.cn/B.2mGs8\r138元/年：http://b.mashort.cn/B.2jMM6');
                            } else if (calcWords('我想使用爱用商品高级功能')) {
                                isAutoReplayed = true;
                                replyMessage('爱用商品高级版：自动上下架，全店生成手详，标题优化，关联销售，主图视频，主图水印，批量修改、复制宝贝，违规词检测、促销打折、拼团拍卖等，据用户反馈说，拼团拍卖对拉新效果很不错的呢！\r亲爱的，遇见有用的东西就把它买下来，钱并不是真的花掉了，只是换一种方式陪伴在您身边为您创造更多的价值~该花的钱省不得，软件一季度52元，合算下来一天5毛钱多一点。买它！\r\r苹果手机用户尊享——爱用商品高级版订购链接..\r52元/季度：http://b.mashort.cn/B.29QbE\r95元/半年：http://b.mashort.cn/B.28hmQ\r138元/年：http://b.mashort.cn/B.2j3n1');
                            }

                            // ios中提示优惠券话术
                            if (calcWords("请给我交易限时专属福利")) {
                                isAutoReplayed = true;
                                replyMessage(`现在续费仅需10.6元/月,,\n12个月周期：https://tb.cn/c61t54w\n6个月周期：https://tb.cn/BP2t54w`);
                            }
                            if (calcWords("请给我商品限时专属福利")) {
                                isAutoReplayed = true;
                                replyMessage(`现在续费仅需10.6元/月..\n12个月周期：https://tb.cn/UZ6s54w\n6个月周期：https://tb.cn/TI2s54w`);
                            }
                            // ios事后提示窗话术
                            if (calcWords("我想继续使用交易-")) {
                                isAutoReplayed = true;
                                replyMessage(`老用户专享价,,每天仅需3毛5！\n128元/年：https://tb.cn/Q2bak4w\n75元/半年：https://tb.cn/IPeak4w`)
                            }
                            if (calcWords("我想继续使用商品-")) {
                                isAutoReplayed = true;
                                replyMessage(`老用户专享价..每天仅需3毛5！\n128元/年：https://tb.cn/IQvak4w\n75元/半年：https://tb.cn/vExak4w`)
                            }
                            // ios续费
                            // ios 续费弱提示 old
                            if (calcWords("避免双11访客流量降低")) { // 商品
                                isAutoReplayed = true;
                                replyMessage(`续费专享优惠..每天仅限前100名！\n75元/半年：https://c.tb.cn/Y4.Y3PVN\n138元/年：https://c.tb.cn/Y4.Y3I9J`)
                            }
                            if (calcWords("如何避免DSR跌失")) { // 交易
                                isAutoReplayed = true;
                                replyMessage(`续费专享优惠,,每天仅限前100名！\n68元/半年：https://tb.cn/PXObbwv\n128元/年：https://tb.cn/TV6kt3w`)
                            }
                            // ios 续费弱提示 
                            if (calcWords("继续使用商品全部功能")) { // 商品
                                isAutoReplayed = true;
                                replyMessage(`您的爱用商品高级版即将到期！现在给您续费专享优惠..低至0.35元/天~\n每天仅限前100名哦！\n75元/半年：https://c.tb.cn/Y4.Y3PVN\n138元/年：https://c.tb.cn/Y4.Y3I9J`)
                            }
                            if (calcWords("继续使用交易全部功能")) { // 交易
                                isAutoReplayed = true;
                                replyMessage(`您的爱用交易高级版即将到期！现在给您续费专享优惠,,低至0.35元/天~\n每天仅限前100名哦！\n75元/半年：https://c.tb.cn/Y4.YeRc1\n138元/年：https://c.tb.cn/Y4.Y09Da`)
                            }
                            // ios 续费中提示
                            if (calcWords("请给我爱用商品专属权益")) {
                                isAutoReplayed = true;
                                replyMessage(`高级会员专属权益！这边帮您申请的商品专属优惠价，每天仅需3毛5..亲亲可不能给别人哦！https://tb.cn/9l5vN3w`)
                            }
                            if (calcWords("请给我爱用交易专属权益")) {
                                isAutoReplayed = true;
                                replyMessage(`高级会员专属权益！这边帮您申请的交易专属优惠价，每天仅需3毛5,,亲亲可不能给别人哦！https://tb.cn/W2wuN3w`)
                            }
                            // ios 续费强提示 old
                            if (calcWords("继续运行全部功能,,每天仅需3毛5！")) { // 交易
                                isAutoReplayed = true;
                                replyMessage(`75元/半年：https://c.tb.cn/Y4.YeRc1\n138元/年：https://c.tb.cn/Y4.Y09Da`)
                            }
                            if (calcWords("全力备战双11..每天仅需3毛5！")) { // 商品
                                isAutoReplayed = true;
                                replyMessage(`75元/半年：https://c.tb.cn/Y4.Y3PVN\n138元/年：https://c.tb.cn/Y4.Y3I9J`)
                            }
                            // ios 续费强提示
                            if (calcWords("避免工作效率降低，发送此话术至客服，享老用户特权！")) { // 交易
                                isAutoReplayed = true;
                                replyMessage(`避免工作效率降低,,立享老用户专属特权\n原价120元/半年，现在仅需75元/半年：https://c.tb.cn/Y4.YeRc1\n原价240元/年，现在仅需138元/年：https://c.tb.cn/Y4.Y09Da\n每天仅限前100名！`)
                            }
                            if (calcWords("避免宝贝权重跌失，发送此话术至客服，享老用户特权！")) { // 商品
                                isAutoReplayed = true;
                                replyMessage(`避免宝贝权重跌失..立享老用户专属特权\n原价120元/半年，现在仅需75元/半年：https://c.tb.cn/Y4.Y3PVN\n原价240元/年，现在仅需138元/年：https://c.tb.cn/Y4.Y3I9J\n每天仅限前100名！`)
                            }
                            // 新手村自动回复话术
                            if (calcWords("你好，请问爱用商品PC端如何打开")) {
                                isAutoReplayed = true;
                                replyMessage(`亲，请在电脑端点击下面的链接进入爱用商品PC端哦.. https://h5.m.taobao.com/qn/pc/2-03-00/plugin-guide.html?appkey=21085832`)
                            }
                            // 新手村七天签到
                            if (calcWords("你好，我已完成爱用交易7天签到，如何优惠解锁插件所有功能呀？")) {
                                isAutoReplayed = true;
                                replyMessage(`恭喜你完成爱用交易新人签到任务,,点击新人专享升级链接https://tb.cn/iEnTn2w，立减20元升级到季度高级版哦，升级完成就可使用插件所有功能了`)
                            }

                            if (calcWords("你好，我已完成7天签到，如何优惠解锁插件所有功能呀？")) {
                                isAutoReplayed = true;
                                replyMessage(`恭喜你完成新人签到任务..点击新人专享升级链接https://tb.cn/KxMro3w，立减20元升级到季度高级版哦，升级完成就可使用插件所有功能了`)
                            }

                            if (calcWords('我要订购爱用交易') && calcWords("FW_GOODS-1827490")) {
                                isAutoReplayed = true;
                                freeRenewal = true;
                                replyMessage(`亲亲 点击上面的链接订购就可以了`);
                            }

                            if (calcWords('我要订购爱用商品') && calcWords("FW_GOODS-1828810")) {
                                isAutoReplayed = true;
                                freeRenewal = true;
                                replyMessage(`亲亲 点击上面的链接订购就可以了`);
                            }

                            if (calcWords("我可以获得什么") || calcWords("我要提交我的苹果答案")) {

                                if (calcWords("爱用商品新人专享是什么") || calcWords("我是爱用商品iOS用户")) {
                                    isAutoReplayed = true;
                                    replyMessage(`恭喜您啦！获得新人专享礼包——爱用商品高级版\n老客原价88元/半年=0.48元/天..\n新人专享72元/半年=0.39元/天\n这是72元临时优惠链接：https://tb.cn/AZfnc0w 立即领取`);
                                }

                                if (calcWords('爱用交易新人专享是什么') || calcWords("我是爱用交易iOS用户")) {
                                    isAutoReplayed = true;
                                    replyMessage(`恭喜您啦！获得新人专享礼包——爱用交易高级版\n老客原价88元/半年=0.48元/天,,\n新人专享72元/半年=0.39元/天\n这是72元临时优惠链接：https://tb.cn/66b102w 立即领取`);
                                }
                            }


                            //PDD订购 10月10日不要
                            // if (calcWords("我想了解关于优惠方案的更多信息，请告知")) {
                            //     replyMessage(`亲，因为该平台的业务调整导致我们自9月25号起就没有办法免费提供所有功能了，需向平台订购后才能获得授权，爱用有20万该平台用户，爱用愿拿出100万补贴一直支持我们的用户，我们正在向平台争取中，详细方案25号公布`)
                            // }

                            // 双十一狗姐运营活动
                            if (calcWords("我要领取交易专属红包")) {
                                isAutoReplayed = true;
                                replyMessage(`专属红包优惠,,\n80半年：https://tb.cn/ThQxzxv\n138年：https://tb.cn/x5Hxzxv`)
                            }
                            if (calcWords("我要领取商品专属红包")) {
                                isAutoReplayed = true;
                                replyMessage(`专属红包优惠..\n78半年：https://tb.cn/IAzxzxv\n128年：https://tb.cn/4Qtxzxv`)
                            }
                            if (calcWords("我要领取联合专属红包")) {
                                isAutoReplayed = true;
                                replyMessage(`商品+交易联合促销,,\n专属红包价6个月138元：https://tb.cn/NY6RNyv`)
                            }
                            if (calcWords("我的千牛版本过低")) {
                                isAutoReplayed = true;
                                replyMessage(`http://mupppub.cn-hangzhou.oss.aliyun-inc.com/115146/12544494/5d1285df4b5b21c220fbad49a3c3f72b/700145%40app_main_7.9.1.apk\n   您好亲，这个是安卓包二维码只针对安卓用户，需要到浏览器上下载\n苹果手机的话在app store里直接更新就可以的.. `)
                            }

                            if (calcWords('我想1元订购爱用交易高级功能') ||
                                calcWords("【爱用交易】我想1元开通所有功能") ||
                                calcWords("我想爱用交易获得1元购优惠券")) {
                                isAutoReplayed = true;
                                replyMessage(`亲亲，需要购买直接点击上面的链接就可以了哦 /:081,,`);
                            }

                            if (calcWords("我想1元开通爱用商品所有功能，获得1元优惠券") ||
                                calcWords("【爱用商品】我想1元开通所有功能") ||
                                calcWords('我想1元订购爱用商品高级功能')) {
                                isAutoReplayed = true;
                                replyMessage(`亲亲，需要购买直接点击上面的链接就可以了哦 /:081..`)
                            }

                             if (calcWords("我是高级版用户") || calcWords("我是初级版用户")) {
                                 if (calcWords('使用爱用商品')) {
                                     if (calcWords("促销打折")) {
                                        isAutoReplayed = true;
                                         replyMessage(`点击链接订购后就可以继续使用功能哦\n52元/季度：https://c.tb.cn/Y4.YXbbH\n95元/半年：https://c.tb.cn/Y4.Y2XTE\n138元/年：https://c.tb.cn/Y4.Ybwpl`);
                                     }
                                     if (calcWords("满减优惠")) {
                                        isAutoReplayed = true;
                                         replyMessage(`点击链接订购后就可以继续使用功能哦\n52元/季度：https://c.tb.cn/Y4.Ycb4k\n95元/半年：https://c.tb.cn/Y4.bAQ2Z\n138元/年：https://c.tb.cn/Y4.Yd455`);
                                     }
                                     if (calcWords("促销水印")) {
                                        isAutoReplayed = true;
                                         replyMessage(`点击链接订购后就可以继续使用功能哦\n52元/季度：https://c.tb.cn/Y4.Ya7hk\n95元/半年：https://c.tb.cn/Y4.Ycbwm\n138元/年：https://c.tb.cn/Y4.YbLbP`);
                                     }
                                 }
                             }

                            // 爱用商品，预约图片空间清理功能
                            if (calcWords("请帮我预约") && calcWords("功能")) {
                                isAutoReplayed = true;
                                replyMessage(`好的，已经帮您提交预约申请，功能上线后，第一时间通知您`);
                            }

                            if (calcWords('我想0元续订初级版')) {
                                if (calcWords('爱用商品')) {
                                    isAutoReplayed = true;
                                    freeRenewal = true;
                                    Invoke.qnSendMessage(jsonobj['fromuid'], '爱用商品免费版链接,,\nhttp://fuwu.taobao.com/ser/assembleParam.htm?subParams=itemCode:FW_GOODS-1828810-1,cycleNum:12,cycleUnit:2');
                                }else if (calcWords('爱用交易')){
                                    isAutoReplayed = true;
                                    freeRenewal = true;
                                    Invoke.qnSendMessage(jsonobj['fromuid'], '爱用交易免费版链接..\nhttps://fuwu.taobao.com/ser/assembleParam.htm?spm=a1z13.2196529.0.0.1b1f519fmbgMhQ&tracelog=search&activityCode=&promIds=&subParams=itemCode:FW_GOODS-1827490-1,cycleNum:12,cycleUnit:2');
                                }
                            }

                            if (calcWords('我想预约使用爱用交易的数据中心功')) {
                                isAutoReplayed = true;
                                Invoke.qnSendMessage(jsonobj['fromuid'], '数据中心正在内部测试哦～\n您已获得优先体验资格，在这个功能上线后即可第一时间试用！\n===============\n在功能测试阶段，欢迎大家为新功能提供宝贵建议！\n');
                            }
                            if (calcWords('我想预约体验虚拟宝贝自动发货')) {
                                isAutoReplayed = true;
                                Invoke.qnSendMessage(jsonobj['fromuid'], '爱用自动发货有以下特点：\n1、安全可靠、无需下载第三方软件；\n2、自动响应、无需手动或代理挂机；\n3、场景丰富、支持配置积分复购、会员体系等多种自定义场景。\n============================\n您已预约体验成功，功能上线后您的账号可获得优先体验资格！\n');
                            }
                            if (calcWords('我想预约爱用自动发货插件')) {
                                isAutoReplayed = true;
                                Invoke.qnSendMessage(jsonobj['fromuid'], '您已预约成功，功能上线后您的账号可获得优先体验资格！');
                            }
                            

                            // 如果不是需要自动回复的，返回默认接待话术
                            if (!bIsReply) {
                                if (Invoke.dutyTime() && window.ayUserNick == '爱用科技:淘子悟') {
                                    isAutoReplayed = true;
                                    Invoke.qnSendMessage(jsonobj['fromuid'], '尊敬的掌柜您好，客服小哥哥小姐姐的在线时间是8：30——23:00，给您带来不便深表歉意，您可以留言您要咨询的问题，客服上线就回复您。祝店铺大卖财源广进/:073');
                                }
                            }

                            if (bIsReply) {
                                $.getJSON("https://mcs.aiyongtech.com/1.gif?p=TD20200706110701&e=AD_EV_ROB_REPLYED_AUTO&m1="+window.ayUserNick+"&m2=" + jsonobj['fromuid'], function(data) {});
                            }

                            // 直接跳转销售处理
                            if ( calcWords('粽子公仔') ||
                                (calcWords('小店铺到大店铺') && calcWords('需要多少天')) || 
                                (calcWords('预约专家帮忙') && calcWords('收费吗')) ||
                                (calcWords('店铺销售一直平平') && calcWords('我的店铺有问题吗')) 
                                ) {
                                data = { 'msg': msgcont, 'nick': jsonobj['fromuid'] };
                                data['type'] = 102;
                                Invoke.asktransmitSales(jsonobj['fromuid']);
                                return;
                            }

                            // 直接跳转客服处理
                            if (calcWords("升级失败") || calcWords("我来领礼包")) {
                                data = { 'msg': msgcont, 'nick': jsonobj['fromuid'] };
                                    // 转给在线客服
                                data['type'] = 101;
                                Invoke.asktransmitKefu(jsonobj['fromuid']);
                                return;
                            }


                            if (isAutoReplayed) {
                                __TransferContacts_[jsonobj['fromuid']] = 1;
                                if (freeRenewal) {
                                    __TransferFreeVersion_[jsonobj['fromuid']] = 1;
                                }
                            } else {
                                var isReplyed = __TransferContacts_[jsonobj['fromuid']];
                                data = { 'msg': msgcont, 'nick': jsonobj['fromuid'] };
                                var refused = Invoke.userRefused(msgcont);
                                var lastfreeRenewal = __TransferFreeVersion_[jsonobj['fromuid']]

                                // 如果没有点击过广告或者发送信息为拒绝内容或是点击的初级版广告则转给在线客服
                                if (isReplyed != 1 || refused || lastfreeRenewal == 1) {
                                    // 转给在线客服
                                    data['type'] = 101;
                                    Invoke.asktransmitKefu(jsonobj['fromuid']);
                                    return;
                                } else {
                                    // 转给在线销售
                                    data['type'] = 102;
                                    Invoke.asktransmitSales(jsonobj['fromuid']);
                                    return;
                                }
                            }

                            setTimeout(function(){
                                QN.wangwang.invoke({
                                    cmd: "insertText2Inputbox",
                                    param: {
                                        uid: jsonobj['fromuid'],
                                        text: ' ',
                                        type: 1
                                    }
                                })

                                WSConnect.sendMessage(Invoke.__makeListenResult__("close", data));

                            }, 500);


                        }, 1000);
                    }
                };
                param[tag] = tagValue;
                QN.event.regEvent(param);
            },
            correctNick:function(strCode){
                var fdStart = strCode.indexOf("cntaobao");
                if(fdStart == 0){
                  return strCode;
                }else{
                   return 'cntaobao'+strCode; 
                }
            },
            userRefused:function(msgContent){
                var refuseWord = ['不需要','不用','不要','投诉'];
                for (var i = refuseWord.length - 1; i >= 0; i--) {
                    refWord = refuseWord[i]
                    if (msgContent.indexOf(refWord) > -1) {
                        // 简单处理表示拒绝的用户
                        if (msgContent.length < 6) {
                            return true;
                        }
                    }
                }
                return false;
            },
            asktransmitKefu: function(sellernick) {
                var xmlhttp = new XMLHttpRequest();
                var askSellernick = sellernick.replace(/cntaobao/, "");

                xmlhttp.open("GET", "https://crm.aiyongtech.com/sellerfilter/qgetkfnick?sellernick="+askSellernick, true);
                xmlhttp.send();
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        var jsonObj = JSON.parse(xmlhttp.responseText);
                        var nick = jsonObj['result'];
                        //
                        Invoke.transferContact(sellernick, nick);
                        $.getJSON("https://mcs.aiyongtech.com/1.gif?p=TD20200706110701&e=AD_EV_ROB_TRANSFORM_KF&m2=" + nick + "&m3=" + askSellernick+"&m1="+window.ayUserNick, function(data) {});
                    }
                }
            },
            asktransmitSales: function(sellernick) {
                var xmlhttp = new XMLHttpRequest();
                var askSellernick = sellernick.replace(/cntaobao/, "");
                xmlhttp.open("GET", "https://crm.aiyongtech.com/sellerfilter/getDispathSales?sellernick=" + askSellernick, true);
                xmlhttp.send();
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        console.log(xmlhttp.responseText);
                        // 解析返回的JSON
                        var jsonObj = JSON.parse(xmlhttp.responseText);
                        var nick = jsonObj['nick'];
                        if (nick != null && nick != undefined) {
                            Invoke.transferContact(sellernick, nick);

                            // 如果state == sales 则统计销售  state == kefu 就统计客服
                            if (jsonObj['state'] == 'kefu') {
                                $.getJSON("https://mcs.aiyongtech.com/1.gif?p=TD20200706110701&e=AD_EV_ROB_TRANSFORM_KF&m2=" + nick + "&m3=" + sellernick+"&m1="+window.ayUserNick, function(data) {});
                            }else if (jsonObj['state'] == 'sales'){
                                $.getJSON("https://mcs.aiyongtech.com/1.gif?p=TD20200706110701&e=AD_EV_ROB_TRANSFORM_SALES&m2=" + nick + "&m3=" + sellernick+"&m1="+window.ayUserNick, function(data) {});
                            }
                        }
                    }
                }
            },
            dutyTime: function() {
                var bAutoReply = true;
                var myDate = new Date();
                var hour = myDate.getHours();
                var beginHour = 8;
                var endHour = 23;
                if (hour >= beginHour && hour < endHour) {
                    bAutoReply = false;
                    if (hour == beginHour && myDate.getMinutes() < 30) {
                        bAutoReply = true;
                    }
                }
                return bAutoReply;
            },
            qnSendMessage: function(toNIck, sendContent) {
                var targetId = Invoke.correctNick(toNIck);
                var msgType = "sendMsg";
                var invokeArgus = {};
                invokeArgus['cmd'] = msgType;
                invokeArgus['param'] = { "msgContent": "\\T" + sendContent, "targetID": targetId, "type": 0 };
                invokeArgus["success"] = function() {
                    var exact = null;
                    if (msgType === "insertText2Inputbox") {
                        if (ifClick) {
                            exact = "click";
                        } else {
                            exact = "open";
                        }
                    }
                };
                invokeArgus["error"] = function(msg) {
                    WSConnect.sendMessage(Invoke.__makeSendMsgResult__(msgid, false, null, msg));
                }
                QN.wangwang.invoke(invokeArgus);
            },
            __makeListenResult__: function(state, msgNode) {
                var reqObj = { "act": "msgListen", "usernick": window.ayUserNick };
                reqObj["state"] = state;
                if (msgNode != undefined && msgNode != null) {
                    reqObj["msg"] = msgNode;
                }
                return JSON.stringify(reqObj);
            }
        };
        window.LoveSeller.init = initPushMessage;
        window.LoveSeller.Invoke = Invoke;
        window.__TransferContacts_ = {};
        window.__TransferFreeVersion_ = {};
    })(window.LoveSeller);
    window.LoveSeller.init();
} else {
    window.LoveSeller.init();
}
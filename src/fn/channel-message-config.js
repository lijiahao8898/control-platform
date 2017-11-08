/**
 * Created by lijiahao on 17/7/19.
 */
/**
 * Created by lijiahao on 17/7/6.
 * vue first
 */
;(function () {
    var main = {
        init: function () {
            this.id = HDL.getQuery('id');
            this.updateInfo = false;
            this.validator = new FormValidator();
            this.validator.settings.alerts = true;
            this.addEvent();
            this.vueFunc();
        },
        /**
         * tip
         * @param data
         * @param success
         * @param fail
         */
        tip: function (data, success, fail) {
            this.dialogTip = jDialog.tip(data.content, {
                target: data.target,
                position: data.position || 'left'
            }, {
                width: data.width || 200,
                closeable: false,
                closeOnBodyClick: true,
                buttonAlign: 'center',
                buttons: [{
                    type: 'highlight',
                    text: '确定',
                    handler: function (button, dialog) {
                        success && success(button, dialog)
                    }
                }, {
                    type: 'highlight',
                    text: '取消',
                    handler: function (button, dialog) {
                        fail && fail(button, dialog)
                    }
                }]
            });
        },
        addEvent: function () {
            //$(document).on('click', '.copy-btn', function () {
            //    var client = new ZeroClipboard($('.copy-btn'));
            //    client.on('ready', function() {
            //        $('.copy-btn').removeClass('copy-btn');
            //        client.on('copy', function(event) {
            //        });
            //        client.on('aftercopy', function() {
            //            toastr.success('链接复制成功!','提示');
            //        });
            //    });
            //});
        },
        vueFunc: function () {
            var that = this;
            var app = new Vue({
                el: '#messageConfig',
                data: {
                    show: true,
                    showOther: false,
                    data: {
                        nick_name: '',
                        user_name: '',
                        head_img: '',
                        qr_code: '',
                        app_id: '',
                        app_secret: '',
                        jPushKey: '',
                        jPushSecret: '',
                        BonusProcessor: '',
                        DeliveryProcessor: '',
                        SignInProcessor: '',
                        FansProcessor: '',
                        OrderProcessor: '',
                        LotteryChanceProcessor: '',
                        third_app_id: '',
                        third_app_secret: '',
                        wechat_open_id: '',
                        wechat_thirdparty_id: ''
                    }
                },
                created: function () {
                    var _self = this;
                    if (that.id) {
                        that.getData(function (data) {
                            if (data.data.wechat_open_d_t_o) {
                                that.updateInfo = true;
                            }
                            // 返回的数据和提交的不一样,拼装数据
                            console.log(_self.data);
                            if (data.data.wechat_open_d_t_o) {
                                _self.data.nick_name = data.data.wechat_open_d_t_o.nick_name;
                                _self.data.user_name = data.data.wechat_open_d_t_o.user_name;
                                _self.data.head_img = data.data.wechat_open_d_t_o.head_img;
                                _self.data.qr_code = data.data.wechat_open_d_t_o.qr_code;
                                _self.data.app_id = data.data.wechat_open_d_t_o.appid;
                                _self.data.app_secret = data.data.wechat_open_d_t_o.app_secret;
                                _self.data.wechat_open_id = data.data.wechat_open_d_t_o.id;
                            }

                            if (data.data.wechat_thirdparty_d_t_o) {
                                _self.data.third_app_id = data.data.wechat_thirdparty_d_t_o.component_appid;
                                _self.data.third_app_secret = data.data.wechat_thirdparty_d_t_o.component_appsecret;
                                _self.data.wechat_thirdparty_id = data.data.wechat_thirdparty_d_t_o.id;
                            }

                            if (data.data.message_wechat_property_d_o) {
                                for (var i = 0; i < data.data.message_wechat_property_d_o.length; i++) {
                                    if (data.data.message_wechat_property_d_o[i].p_key) {
                                        _self.data[data.data.message_wechat_property_d_o[i].p_key] = data.data.message_wechat_property_d_o[i].p_value
                                    }
                                }
                            }
                        });
                    }
                },
                mounted: function () {
                    $('#openShopHistory').show();
                },
                updated: function () {
                    var client = new ZeroClipboard($('.copy-btn'));
                    client.on("ready", function (readyEvent) {
                        console.log("ZeroClipboard SWF is ready!");
                        $('.copy-btn').removeClass('copy-btn');
                        client.on('copy', function (event) {

                        });
                        client.on("aftercopy", function (event) {
                            // `this` === `client`
                            // `event.target` === the element that was clicked
                            //event.target.style.display = "none";
                            //alert("Copied text to clipboard: " + event.data["text/plain"] );
                            toastr.success('复制' + event.data["text/plain"] + '成功!', '提示');
                        });
                    });
                },
                methods: {
                    submit: function () {
                        var _self = this;
                        this.data.channel_id = that.id;
                        console.log('提交了');
                        var required, result;
                        var isValid = true;
                        // required input validator 验证第二步里面的表单
                        required = $('input[required]');
                        for (var i = 0; i < required.length; i++) {
                            result = that.validator.checkField.call(that.validator, required.eq(i));
                            if (result.valid === false) {
                                isValid = false;
                                toastr.error('有内容未填写或书写规范,无法提交~', '提示');
                                return;
                            }
                        }
                        if (isValid == true) {
                            console.log(this.data);
                            if (that.updateInfo === true) {
                                // 更新
                                that.updateData(this.data);
                            } else {
                                // 提交
                                that.submitData(this.data);
                            }
                        }
                    },
                    copy: function () {
                        var client = new ZeroClipboard($('.copy-btn'));
                        client.on("ready", function (readyEvent) {
                            console.log("ZeroClipboard SWF is ready!");
                            $('.copy-btn').removeClass('copy-btn');
                            client.on('copy', function (event) {

                            });
                            client.on("aftercopy", function (event) {
                                // `this` === `client`
                                // `event.target` === the element that was clicked
                                //event.target.style.display = "none";
                                //alert("Copied text to clipboard: " + event.data["text/plain"] );
                                toastr.success('复制' + event.data["text/plain"] + '成功!', '提示');
                            });
                        });
                    },
                    cancel: function (e) {
                        console.log('取消了');
                        that.tip({
                            target: e.currentTarget,
                            position: 'right',
                            content: '未保存的数据将会丢失，确定要离开吗?'
                        }, function (btn, dialog) {
                            dialog.close();
                            location.href = 'channel-management.html';
                        }, function (btn, dialog) {
                            dialog.close();
                        })
                    },
                    tabClick: function (e, value) {
                        var target = e.currentTarget;
                        $('#goodsTab li').removeClass('active');
                        $(target).addClass('active');
                        if (value == 1) {
                            this.show = true;
                            this.showOther = false;
                        } else if (value == 2) {
                            this.show = false;
                            this.showOther = true;
                        }
                    },
                    freeze: function (e, currentData) {
                        var target = e.currentTarget;
                        var id = currentData.id;
                        var status = currentData.status;
                        var name = currentData.storage_name;
                        var _self = this;
                        that.tip({
                            target: target,
                            content: status == 1 ? '确定要关闭' + name + '吗?' : '确定要激活' + name + '吗?'
                        }, function (btn, dialog) {
                            toastr.success((status == 1 ? '关闭' : '激活') + name + '成功!', '提示');
                            for (var i = 0; i < _self.dataList.data.data.length; i++) {
                                if (_self.dataList.data.data[i].id == id) {
                                    _self.dataList.data.data[i].status = (status == 1 ? 2 : 1);
                                }
                            }
                            dialog.close();
                        }, function (btn, dialog) {
                            dialog.close();
                        })
                    }
                }
            });
        },
        submitData: function (data) {
            var that = this;
            Api.get({
                url: '/channel/control/message_config/add.do',
                data: data,
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('添加成功!', '提示')
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        updateData: function (data) {
            var that = this;
            Api.get({
                url: '/channel/control/message_config/update.do',
                data: data,
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('更新成功!', '提示');
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        getData: function (cb) {
            var that = this;
            Api.get({
                url: '/channel/control/message_config/get.do',
                data: {
                    channel_id: that.id
                },
                mask: true,
                beforeSend: function () {

                },
                success: function (data) {
                    cb && cb(data);
                    //that.pagination(data.data.total_count);
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        }
    };
    // run
    $(function () {
        main.init();
    })
})();
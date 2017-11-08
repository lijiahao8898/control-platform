/**
 * Created by lijiahao on 17/3/2.
 */
;(function () {
    var main = {
        init: function () {
            this.page = {};
            this.page.pageSize = 20;
            this.page.vpage = 10;
            this.pageId = 1;

            // 弹出框页面
            this.page_pop = {};
            this.page_pop.pageSize = 10;
            this.page_pop.vpage = 10;
            this.page_pop.pageId = 1;

            // 批量发货－待发货订单列表
            this.page_pop_select = {};
            this.page_pop_select.pageSize = 10;
            this.page_pop_select.vpage = 10;
            this.page_pop_select.pageId = 1;

            this.search_key = {};
            // 待发货订单导出弹框
            this.order_ids_list = [];
            this.search_select_key = {
                order_sn: ''
            };

            this.orderStatusData = {
                '10': '待支付',
                '20': '买家已取消',
                '21': '卖家已取消',
                '30': '已支付',
                '40': '已发货',
                '50': '已签收',
                '60': '已评价',
                '70': '退款中',
                '80': '退款完成',
                '90': '订单关闭'
            };
            this.dateTimerPick();
            this.addEvent();
            this.queryOrderList();
        },
        // 搜索框搜索条件获取数据
        get_search_key: function () {
            var that = this;
            var key = $('.presentation.active').find('a').data('key');
            var value = $('.presentation.active').find('a').data('value');
            that.search_key[key] = value;
            that.search_key = {
                order_sn : $.trim($('#order_sn').val()) || '',
                consignee : $.trim($('#consignee').val()) || '',
                order_status : $('#order_status').val() == '0' ? '' : $('#order_status').val(),
                consignee_mobile : $.trim($('#consignee_mobile').val()),
                payment_id : $('#payment_id').val() == '0' ? '' : $('#payment_id').val()
            }
            return that.search_key;
        },
        // tab健快速搜索获取数据
        get_guick_search_key: function (key,value) {
            var that = this;
            that.search_key = {
                order_sn : '',
                consignee : '',
                order_status : '',
                consignee_mobile : '',
                payment_id : ''
            }
            that.search_key[key] = value;
            return that.search_key;
        },
        addEvent: function () {
            var that = this;

            // 搜索框按钮集合  ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
            // 搜索
            $('#j-search').click(function () {
                that.pageId = 1;
                that.get_search_key();
                that.queryOrderList();
            });
            // 导出订单
            $('#j-exportOrderList').click(function () {
                // 导出时，不导出正在维权订单
                that.get_search_key();
                if (that.search_key.order_status == ' 维权') {
                    return false;
                }
                var config = {};
                config.target = $(this);
                config.position = 'bottom';
                config.width = '250';
                config.content = '将导出XXXX个订单，导出后，请点击&quot;已生成报表&quot;按钮进入导出列表下载。';
                that.tip(config, function (btn, dialog) {
                    that.exportOrderList();
                    dialog.close();
                },function(){},'single');
            });
            // 查看已生成列表
            $('#j-checkOrderList').click(function () {
                that.checkOrderList();
            });
            // 点击订单列表的tab快速搜索
            $(document).on('click', '.quick-search', function () {
                var $this = $(this);
                if ($this.hasClass('active')) {
                    return false;
                }
                var key = $this.data('key');
                var value = $this.data('value');
                that.get_guick_search_key(key,value);
                that.queryOrderList();
            });
            // 搜索框按钮集合  ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊

            // 订单列表按钮集合  ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
            // 加星
            $(document).on('click', '.j-star', function () {
                var data = {};
                data.order_id = $(this).attr('data-id');
                data.user_id = $(this).attr('data-user_id');
                data.asterisk_marks = $(this).attr('data-asterisk_mark') == 1 ? 'n' : 'y';
                that.addStar(data);
            });

            // 备注
            $(document).on('click', '.j-add-comment', function () {
                var sendData = {};
                var config = {};
                var memo = $(this).attr('data-memo');
                sendData.order_id = $(this).attr('data-id');
                sendData.user_id = $(this).attr('data-user_id');
                config.target = $(this);
                config.position = 'right';
                config.width = '250';
                config.content = '<div><textarea class="form-control form-control-lg j-memo" maxlength="200" style="min-height: 100px;">' + (memo == undefined ? '' : memo) + '</textarea></div>';
                that.tip(config, function (btn, dialog) {
                    sendData.memo = $.trim($('.j-memo').val());
                    that.addMemo(sendData);
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                })
            });
            // 发货
            $(document).on('click', '.j-send-goods', function () {
                var orderInfo = JSON.parse(decodeURIComponent($(this).attr('data-orderinfo')));
                var refundMark = $(this).attr('data-refund_mark');
                var order_id = $(this).attr('data-order_id');
                var user_id = $(this).attr('data-user_id');
                // 发货的时候存在 维权商品
                if (refundMark && refundMark == 1) {
                    toastr.error('订单中的部分商品，买家已提交了维权申请，您需要先处理（同意或拒绝）买家退款申请后，才能够进行发货操作。', '提示');
                    return false;
                }

                var data = {};
                data.title = '商品发货';
                data.content = '<div id="orderInfo"></div>';
                data.width = 800;
                that.popup(data, function () {
                    var template = _.template($('#j-template-send-goods').html());
                    $('#orderInfo').html(template({
                        item: orderInfo,
                        orderStatus: that.orderStatusData
                    }));
                    that.iCheck();
                    that.queryLogisticsCompany();
                }, function (btn, dialog) {
                    // 确定操作
                    var sendGoodsData = {};
                    var checkedBox = $('.checkbox:checked');
                    var needLogistics = $('input[name=logistics]:checked').attr('data-value');
                    var delivery_company = $('#logisticsList').val();
                    var delivery_code = $.trim($('#logisticCode').val());
                    var orderItem_ids = [];

                    if (checkedBox.length < 1) {
                        toastr.error('请选择要发货的商品', '提示');
                        return false;
                    }

                    if (needLogistics == 1) {
                        // 需要物流
                        if (delivery_company == '请选择物流公司' || delivery_company == '') {
                            toastr.error('请选择物流公司', '提示');
                            return false;
                        }

                        if (delivery_code == '') {
                            toastr.error('请填写物流单号', '提示');
                            return false;
                        }
                        sendGoodsData.delivery_company = delivery_company;
                        sendGoodsData.delivery_code = delivery_code;
                    }

                    for (var i = 0; i < checkedBox.length; i++) {
                        orderItem_ids.push(checkedBox.eq(i).attr('data-id'));
                    }


                    sendGoodsData.need_delivery = (needLogistics == 1 ? 'y' : 'n');
                    sendGoodsData.order_id = order_id;
                    sendGoodsData.user_id = user_id;
                    sendGoodsData.orderItem_ids = orderItem_ids.toString();

                    console.log(sendGoodsData);
                    that.sendGoods(sendGoodsData, function () {
                        dialog.close();
                    });
                });
            });

            // 批量发货 ===========================
            $(document).on('click', '#j-batching-deliver', function () {
                var data = {
                    title: '批量发货',
                    content: '<div id="batchDeliver"></div>',
                    width: 600,
                    height: 300
                };
                that.popuppage(data, function () {
                    var template = _.template($('#j-template-batching-deliver').html());
                    $('#batchDeliver').html(template());
                    that.imgUpload();
                });
            });
            // 批量发货－导入填好的excel
            $(document).on('click', '#j-upload-excel', function () {
                var self = this;
                var imgUpload = new lib.imgUpload({
                    trigger: '.j-upload-excel',
                    fileName: 'file',
                    targetUrl: '/bossmanager/order/batchDeliverGoods.do',
                    'onUploadStart': function () {
                        self.targetBtn = this.currentTrigger;
                        self.targetBtn.html('导入中...');
                    },
                    'onUploadError': function (e) {
                        self.targetBtn.html('导入填好的EXCEL');
                        toastr.warn("上传失败，请重试!");
                    },
                    'onUploadSuccess': function (data) {
                        self.targetBtn.html('导入填好的EXCEL');
                        if (data.code == 10000) {
                            self._msgBox.done("上传成功");
                        } else {
                            self._msgBox.warn(data.msg);
                        }
                    }
                });
            });
            // 批量发货－选择订单导出---------------------
            $(document).on('click', '#j-select-order-export', function () {
                that.querySelectOrderList();
            });
            // 批量发货 全选
            $('body').on('change', '.o-select-c-all', function () {
                var checked = $('.o-select-c:checked');
                var checked_full = $('.o-select-c');
                var item_order_id;
                if (this.checked) {
                    checked_full.prop('checked', true);
                    for (var i = 0; i < checked_full.length; i++) {
                        item_order_id = checked_full.eq(i).attr('data-order-id');
                        if (that.order_ids_list.indexOf(item_order_id) == -1) {
                            that.order_ids_list.push(item_order_id);
                        }
                    }
                } else {
                    checked_full.prop('checked', false);
                    for (var m = 0; m < checked_full.length; m++) {
                        item_order_id = checked_full.eq(m).attr('data-order-id');
                        var id_index = that.order_ids_list.indexOf(item_order_id);
                        that.order_ids_list.splice(id_index, 1);
                    }
                }
            });
            // 批量发货 单选择
            $('body').on('change', '.o-select-c', function () {
                var checked = $('.o-select-c:checked');
                var checkbox = $('.o-select-c');
                var checkall = $('.o-select-c-all');
                var item_order_id = $(this).attr('data-order-id');
                var id_index = that.order_ids_list.indexOf(item_order_id);
                if (checkbox.length == checked.length) {
                    checkall.prop('checked', true)
                } else {
                    checkall.prop('checked', false)
                }
                var zhi = $(this).is(':checked');
                if (zhi) {
                    if (that.order_ids_list.indexOf(item_order_id) == -1) {
                        that.order_ids_list.push(item_order_id);
                    }
                } else {
                    that.order_ids_list.splice(id_index, 1);
                }
            });
            // 导出待发货订单/选择订单导出
            $('body').on('click', '.d-down-l', function () {
                var order_select = that.order_ids_list.length;
                var order_ids = that.order_ids_list.join(',');

                if (!order_select) {
                    toastr.error('暂未选择要操作的对象!');
                    return false;
                }
                location.href = '/bossmanager/order/download/deliveryOrders.do?order_ids=' + order_ids;
            });
            // 点击搜索
            $('body').on('click', '#s-search', function () {
                that.page_pop_select.pageId = 1;
                that.search_select_key.order_sn =  $('#s-content').val();
                that.querySelectOrderList();
            });
            // 批量发货－选择订单导出---------------------
            // 批量发货 ===========================

            // 修改价格
            $('body').on('click', '.j-change-cost', function () {
                // 依赖数据
                var $this = $(this);
                var order_id = $(this).attr('data-order_id');
                var user_id = $(this).attr('data-user_id');
                var orderInfo = JSON.parse(decodeURIComponent($this.attr('data-orderinfo')));
                var data = {};
                data.title = '修改价格';
                data.content = '<div id="changePriceInfo"></div>';
                data.width = 800;
                that.popup(data, function () {
                    var template = _.template($('#j-template-change-price').html());
                    $('#changePriceInfo').html(template({
                        item: orderInfo,
                        orderStatus: that.orderStatusData
                    }));
                }, function (btn, dialog) {
                    // 确定操作
                    var changePriceData = {};
                    postChangePriceData = {
                        order_id: order_id,
                        user_id: user_id,
                        floating_price: +Number($('input[name=change]').val() * 100).toFixed(0)
                    }
                    that.changePrice(postChangePriceData, function () {
                        dialog.close();
                    });
                });
                // 增加事件监听
                $('input[name=change]').on('change', function () {
                    var diff = +$(this).val();
                    var origin = +$('.js-order-originpay').html();
                    var delivery = +$('.js-order-delivery-fee').html();
                    var money;
                    // if (that.higo_mark == 1) {
                        var tax = +$('.js-order-tax-fee').html();
                        money = Number(origin + delivery + tax + diff).toFixed(2);
                    // } else {
                    //     money = Number(origin + delivery + diff).toFixed(2);
                    // }
                    if (isNaN(Number(diff)) == true) {
                        toastr.error('输入的价格有误', '提示');
                        that.floatMoney = '';
                        that.newPrice = '';
                        that.changeMoneyStatus = false;
                        return false;
                    }
                    // 增加修改的价格判断。如果修改的价格为0 则失败 增加一个改价失败的标记
                    if (money < 0) {
                        toastr.error('修改价格失败，修改后的合计价格不能小于0', '提示');
                        that.floatMoney = '';
                        that.newPrice = '';
                        that.changeMoneyStatus = false;
                        return false;
                    }
                    if (diff > 0) { // 涨价
                        $('.js-order-change').html('+ ' + Number(Math.abs(diff)).toFixed(2));
                    } else { // 减价
                        $('.js-order-change').html('- ' + Number(Math.abs(diff)).toFixed(2));
                    }
                    $('.js-order-realpay').html(money);
                    that.changeMoneyStatus = true;
                })
            });
        // 订单列表按钮集合  ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
        },

        // 修改价格
        changePrice: function (postChangePriceData, cb) {
            var that = this;
            Api.get({
                url: '/order/update_price.do',
                data: postChangePriceData,
                beforeSend: function () {
                },
                success: function (data) {
                    toastr.success('修改成功', '提示');
                    that.queryOrderList();
                    cb && cb(data);
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },

        // 导出订单
        exportOrderList: function () {
            var that = this;

            Api.get({
                url: '/order/downloadOrders.do',
                data: that.search_key,
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('导出成功', '提示');
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },

        // 查看已生成报表
        checkOrderList: function () {
            var that = this;
            var postCheckOrderList = {
                page: that.page_pop.pageId || 1,
                page_size: 10,
                task_type: '2'
            };
            Api.get({
                url: '/item/export/task/query.do',
                data: postCheckOrderList,
                beforeSend: function () {

                },
                success: function (order) {
                    var order_list_data = order.data.data;
                    if ($('#checkOrderInfo').length) {
                        renderCheckOrderList(order_list_data);
                    }else {
                        var data = {
                            title: '导出列表',
                            content: '<div id="checkOrderInfo"></div>',
                            width: 800
                        };
                        that.popuppage(data, function () {
                            renderCheckOrderList(order_list_data);
                        });
                    }
                    function renderCheckOrderList(order_list_data) {
                        if (order_list_data) {
                            var template = _.template($('#j-template-check-orderlist').html());
                            $('#checkOrderInfo').html(template({
                                item: order_list_data
                            }));
                            that.paginationPop(order.data.total_count);
                        }else{
                            $('#checkOrderInfo').html('<table class="table"><tbody><tr><td class="tc" colspan="7">没有任何记录!</td></tr></tbody></table>');
                        }
                    }
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },

        iCheck: function () {
            var that = this;
            if ($("input.flat")[0]) {
                $(document).ready(function () {
                    $('input.flat').iCheck({
                        checkboxClass: 'icheckbox_flat-green',
                        radioClass: 'iradio_flat-green'
                    });
                });
            }

            // checked
            $('#check-all').on('ifClicked', function () {
                if (this.checked) {
                    $('.checkbox').iCheck('uncheck');
                } else {
                    $('.checkbox').iCheck('check');
                }
            });

            $('.checkbox').on('ifChecked', function () {
                var checkedBox = $('.checkbox:checked');
                var checkbox = $('.checkbox');

                if (checkbox.length == checkedBox.length) {
                    $('#check-all').iCheck("check");
                } else {
                    $('#check-all').iCheck("uncheck");
                }
                $(this).parents('tr').addClass('selected');
            });

            $('.checkbox').on('ifUnchecked', function () {
                var checkedBox = $('.checkbox:checked');
                var checkbox = $('.checkbox');

                if (checkbox.length == checkedBox.length) {
                    $('#check-all').iCheck("check");
                } else {
                    $('#check-all').iCheck("uncheck");
                }
                $(this).parents('tr').removeClass('selected');
            })
        },
        /**
         * 导入excel表格
         */
        imgUpload: function () {
            var self = this;
            var imgUpload = new lib.imgUpload({
                trigger: '#j-upload-excel',
                fileName: 'file',
                targetUrl: Api.domain() + '/bossmanager/order/batchDeliverGoods.do',
                'onUploadStart': function () {
                    self.targetBtn = this.currentTrigger;
                    self.targetBtn.html('导入中...');
                },
                'onUploadError': function (e) {
                    self.targetBtn.html('导入填好的EXCEL');
                    toastr.error("上传失败，请重试!");
                },
                'onUploadSuccess': function (data) {
                    self.targetBtn.html('导入填好的EXCEL');
                    if (data.code == 10000) {
                        toastr.success("上传成功");
                    } else {
                        toastr.error(data.msg);
                    }
                }
            });
        },

        /**
         * tip
         * @param data
         * @param success
         * @param fail
         */
        tip: function (data, success, fail, btn) {
            if (btn == 'single') {
                var button =  [{
                    type: 'highlight',
                    text: '确定',
                    handler: function (button, dialog) {
                        success && success(button, dialog)
                    }
                }];
            }else {
                var button =  [{
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
                }];
            }
            this.dialogTip = jDialog.tip(data.content, {
                target: data.target,
                position: data.position || 'left'
            }, {
                width: data.width || 200,
                closeable: false,
                closeOnBodyClick: true,
                buttonAlign: 'center',
                buttons: button
            });
        },
        popup: function (data, cb, success) {
            this.popupDialog = jDialog.dialog({
                title: data.title,
                content: data.content,
                width: data.width || 600,
                height: 600,
                draggable: false,
                buttonAlign: 'right',
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
                        dialog.close();
                    }
                }]
            });
            cb && cb();
        },
        // 查看已生成报表弹框
        popuppage: function (data, cb, success) {
            var that = this;
            this.popupDialog = jDialog.dialog({
                title: data.title,
                content: data.content,
                width: data.width || 600,
                height: data.height || 600,
                draggable: false,
                buttonAlign: 'right',
            });
            $(document).on('click', '#j-select-order-export', function () {
                that.popupDialog.close();
            });
            cb && cb();
        },
        timepicker: function () {
            //$('#timepicker').daterangepicker({
            //    startDate: moment().subtract(29, 'days'),
            //    endDate: moment()
            //}, function(start, end, label) {
            //    console.log(start.format('YYYY-MM-DD'));
            //    console.log(end.format('YYYY-MM-DD'));
            //});
            //$('#timepicker').daterangepicker({
            //    singleDatePicker: true,
            //    singleClasses: "picker_1"
            //}, function(start, end, label) {
            //    console.log(start.toISOString(), end.toISOString(), label);
            //});
        },
        /**
         * 时间选择插件
         */
        dateTimerPick: function () {
            var that = this;
            var optionSet1 = {
                singleClasses: "picker_3",
                startDate: moment().subtract(1, 'days'),
                endDate: moment(),
                minDate: '2012-01-01',
                maxDate: '2099-12-31',
                dateLimit: {
                    days: 365
                },
                singleDatePicker: false,
                showDropdowns: true,
                showWeekNumbers: false,
                timePicker: false,
                timePickerIncrement: 1,
                timePicker12Hour: true,
                ranges: {
                    '今天': [moment(), moment()],
                    '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    '最近七天': [moment().subtract(6, 'days'), moment()],
                    '最近三十天': [moment().subtract(29, 'days'), moment()],
                    '这个月': [moment().startOf('month'), moment().endOf('month')],
                    '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                },
                opens: 'left',
                buttonClasses: ['btn btn-sm btn-default'],
                applyClass: 'btn-sm btn-success',
                cancelClass: 'btn-sm btn-danger',
                format: 'YYYY-MM-DD',
                separator: ' to ',
                locale: {
                    applyLabel: '确定',
                    cancelLabel: '取消',
                    fromLabel: 'From',
                    toLabel: 'To',
                    customRangeLabel: '手动选择日期',
                    daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
                    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                    firstDay: 1
                }
            };
            //$('#timepicker span').html(moment().subtract(29, 'days').format('YYYY-MM-DD') + '~' + moment().format('YYYY-MM-DD'));
            $('#timepicker').daterangepicker(optionSet1, function (start, end, label) {
                console.log(start.toISOString(), end.toISOString(), label);
                $('#timepicker span').text(start.format('YYYY-MM-DD') + ' ~ ' + end.format('YYYY-MM-DD'));
                that.search_key.start_time = start.format('YYYY-MM-DD');
                that.search_key.end_time = end.format('YYYY-MM-DD');
            });

            $('#timepicker').on('cancel.daterangepicker', function (ev, picker) {
                $(this).find('span').text('请选择相应的时间');
                that.search_key.start_time = '';
                that.search_key.end_time = '';
            });

            //$('#reportrange').on('show.daterangepicker', function () {
            //    console.log("show event fired");
            //});
            //$('#reportrange').on('hide.daterangepicker', function () {
            //    console.log("hide event fired");
            //});
            //$('#reportrange').on('apply.daterangepicker', function (ev, picker) {
            //    console.log("apply event fired, start/end dates are " + picker.startDate.format('YYYY-MM-DD') + " to " + picker.endDate.format('YYYY-MM-DD'));
            //});
            //$('#options1').click(function () {
            //    $('#reportrange').data('daterangepicker').setOptions(optionSet1, cb);
            //});
            //$('#options2').click(function () {
            //    $('#reportrange').data('daterangepicker').setOptions(optionSet2, cb);
            //});
            //$('#destroy').click(function () {
            //    $('#reportrange').data('daterangepicker').remove();
            //});
        },
        /**
         * 订单列表
         */
        queryOrderList: function () {
            var that = this;
            Api.get({
                url: '/order/query.do',
                data: {
                    current_page: that.pageId,
                    page_size: that.page.pageSize,
                    order_sn: that.search_key.order_sn || '',
                    consignee_mobile: that.search_key.consignee_mobile || '',
                    start_time: that.search_key.start_time ? that.search_key.start_time : '',
                    end_time: that.search_key.end_time ?  that.search_key.end_time : '',
                    order_status: that.search_key.order_status || '',
                    consignee: that.search_key.consignee || '',
                    user_mobile: '',
                    payment_id: that.search_key.payment_id || '',
                    asterisk_mark: that.search_key.asterisk_mark ?  that.search_key.asterisk_mark : '',
                    print_mark: ''
                },
                mask: true,
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.data.total_count > 0) {
                        var tpl = _.template($('#j-template-order').html());
                        $('#orderList').html(tpl({
                            items: data.data.data,
                            orderStatus: that.orderStatusData
                        }));
                    } else {
                        $('#orderList').html('<table class="table"><tbody><tr><td class="tc" colspan="7">没有任何记录!</td></tr></tbody></table>');
                    }
                    that.pagination(data.data.total_count);
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },
        /**
         * 待发货订单列表
         */
        querySelectOrderList: function () {
            var that = this;
            Api.get({
                url: '/order/query.do',
                data: {
                    current_page: that.page_pop_select.pageId,
                    page_size: that.page_pop_select.pageSize,
                    order_sn: that.search_select_key.order_sn || '',
                    consignee_mobile: that.search_key.consignee_mobile || '',
                    start_time: that.search_key.start_time || '',
                    end_time: that.search_key.end_time || '',
                    order_status: 30,
                    consignee: that.search_key.consignee || '',
                    user_mobile: '',
                    payment_id: that.search_key.payment_id || '',
                    asterisk_mark: that.search_key.asterisk_mark || '',
                    print_mark: ''
                },
                mask: true,
                beforeSend: function () {

                },
                success: function (data) {
                    if ($('#selectOrderExport').length) {
                        renderQuerySelectOrderList();
                    }else{
                        var popdata = {
                            title: '待发货订单列表',
                            content: '<div id="selectOrderExport"></div>',
                            width: 800,
                        };
                        that.popuppage(popdata, function () {
                            renderQuerySelectOrderList();
                        });
                    }
                    function renderQuerySelectOrderList() {
                        if (data.data.total_count > 0) {
                            var template = _.template($('#j-template-select-export').html());
                            $('#selectOrderExport').html(template({
                                items: data.data.data
                            }));
                            that.keepSelect();
                        } else {
                            $('#selectOrderExport').html('<table class="table"><tbody><tr><td class="tc" colspan="7">没有任何记录!</td></tr></tbody></table>');
                        }
                        that.paginationPopSelect(data.data.total_count);
                    }
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },
        keepSelect: function () {
            for (var i = 0; i < $('.o-select-c').length; i++) {
                if (this.order_ids_list.indexOf($('.o-select-c').eq(i).attr('data-order-id')) !== -1) {
                    $('.o-select-c').eq(i).prop('checked', true);
                }
                if ($('.o-select-c').length == $('.o-select-c:checked').length) {
                    $('.o-select-c-all').prop('checked', true)
                } else {
                    $('.o-select-c-all').prop('checked', false)
                }
            }
        },
        /**
         * 获取物流公司.
         */
        queryLogisticsCompany: function () {
            var that = this;
            Api.get({
                url: '/order/queryLogisticsCompany.do',
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var tpl = _.template($('#j-template-logistics').html());
                    $('#logisticsList').html(tpl({
                        items: data.data
                    }));
                    // 物流属性切换
                    $('input[name=logistics]').on('ifChecked', function () {
                        var value = $(this).attr('data-value');
                        if (value == 1) {
                            // 需要物流
                            $('.logistics-info').show();
                        } else {
                            // 不需要物流
                            $('.logistics-info').hide();
                        }
                    })
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },
        /**
         * 加星
         * @param data
         */
        addStar: function (data) {
            var that = this;
            Api.get({
                url: '/order/updateAsteriskMark.do',
                data: data,
                beforeSend: function () {

                },
                success: function (d) {
                    toastr.success('加星成功', '提示');
                    that.queryOrderList();
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },
        /**
         * 备注
         */
        addMemo: function (data) {
            var that = this;
            Api.get({
                url: '/order/updateMemo.do',
                data: data,
                beforeSend: function () {

                },
                success: function (d) {
                    that.queryOrderList();
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },
        /**
         * 发货api
         */
        sendGoods: function (sendData, cb) {
            var that = this;
            Api.get({
                url: '/order/delivery.do',
                data: sendData,
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('发货成功', '提示');
                    that.queryOrderList();
                    cb && cb(data);
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                }
            });
        },
        /**
         * 翻页
         * @param total 总数据量
         */
        pagination: function (total) {
            var that = this;
            var pagination = $('.ui-pagination');
            pagination.jqPaginator({
                totalCounts: total == 0 ? 10 : total,                            // 设置分页的总条目数
                pageSize: that.page.pageSize,                                    // 设置每一页的条目数
                visiblePages: that.page.vpage,                                   // 设置最多显示的页码数
                currentPage: that.pageId,                                        // 设置当前的页码
                first: '<a class="first" href="javascript:;">&lt;&lt;<\/a>',
                prev: '<a class="prev" href="javascript:;">&lt;<\/a>',
                next: '<a class="next" href="javascript:;">&gt;<\/a>',
                last: '<a class="last" href="javascript:;">&gt;&gt;<\/a>',
                page: '<a href="javascript:;">{{page}}<\/a>',
                onPageChange: function (num, type) {
                    that.pageId = num;
                    if (type == 'change') {
                        that.queryOrderList();
                    }
                }
            });
            $('#check-all').iCheck("uncheck");
            var n = $('#orderList').find('table').length;
            if (total && total != 0) {
                $('.pagination-info').html('<span>当前' + n + '条</span>/<span>共' + total + '条</span>')
            } else {
                $('.pagination-info').html('<span>当前0条</span>/<span>共' + total + '条</span>')
            }
        },

        // 弹出框翻页
        paginationPop: function (total) {
            var that = this;
            var pagination_pop = $('.pagination-pop')
            pagination_pop.jqPaginator({
                totalCounts: total == 0 ? 10 : total,                            // 设置分页的总条目数
                pageSize: that.page_pop.pageSize,                                    // 设置每一页的条目数
                visiblePages: that.page_pop.vpage,                                   // 设置最多显示的页码数
                currentPage: that.page_pop.pageId,                                        // 设置当前的页码
                first: '<a class="first" href="javascript:;">&lt;&lt;<\/a>',
                prev: '<a class="prev" href="javascript:;">&lt;<\/a>',
                next: '<a class="next" href="javascript:;">&gt;<\/a>',
                last: '<a class="last" href="javascript:;">&gt;&gt;<\/a>',
                page: '<a href="javascript:;">{{page}}<\/a>',
                onPageChange: function (num, type) {
                    that.page_pop.pageId = num;
                    if (type == 'change') {
                        that.checkOrderList();
                    }
                }
            });
            var n = $('#checkOrderInfo').find('tr').length - 1;
            if (total && total != 0) {
                $('.pagination-info').html('<span>当前' + n + '条</span>/<span>共' + total + '条</span>')
            } else {
                $('.pagination-info').html('<span>当前0条</span>/<span>共' + total + '条</span>')
            }
        },

        // 批量发货－待发货订单 弹出框翻页
        paginationPopSelect: function (total) {
            var that = this;
            var pagination_pop_select = $('.pagination-pop-select')
            pagination_pop_select.jqPaginator({
                totalCounts: total == 0 ? 10 : total,                            // 设置分页的总条目数
                pageSize: that.page_pop_select.pageSize,                                    // 设置每一页的条目数
                visiblePages: that.page_pop_select.vpage,                                   // 设置最多显示的页码数
                currentPage: that.page_pop_select.pageId,                                        // 设置当前的页码
                first: '<a class="first" href="javascript:;">&lt;&lt;<\/a>',
                prev: '<a class="prev" href="javascript:;">&lt;<\/a>',
                next: '<a class="next" href="javascript:;">&gt;<\/a>',
                last: '<a class="last" href="javascript:;">&gt;&gt;<\/a>',
                page: '<a href="javascript:;">{{page}}<\/a>',
                onPageChange: function (num, type) {
                    that.page_pop_select.pageId = num;
                    if (type == 'change') {
                        that.querySelectOrderList();
                    }
                }
            });
            var n = $('#selectOrderExport').find('tr').length - 1;
            if (total && total != 0) {
                $('.pagination-info').html('<span>当前' + n + '条</span>/<span>共' + total + '条</span>')
            } else {
                $('.pagination-info').html('<span>当前0条</span>/<span>共' + total + '条</span>')
            }
        }
    };
    // run
    $(function () {
        main.init();
    })
})();

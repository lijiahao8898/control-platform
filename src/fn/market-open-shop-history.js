/**
 * Created by lijiahao on 17/7/6.
 * vue first
 */
;(function () {
    var main = {
        init: function () {
            this.name = 1;
            this.pageId = 1;
            this.page = {};
            this.page.pageSize = 20;
            this.search_key = {};
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
        vueFunc: function () {
            var that = this;
            var app = new Vue({
                el: '#openShopHistory',
                data: {
                    expiration: {                   // 到期时间
                        type: 'expiration',
                        asc: false,
                        desc: false,
                        value: ''                   // 0 升序 1 降序
                    },
                    recharge: {                     // 充值时间
                        type: 'recharge',
                        asc: false,
                        desc: false,
                        value: ''                   // 0 升序 1 降序
                    },
                    searchValue: {                  // 搜索
                        name: '',                   // 用户ID,昵称或者联系方式
                        channel: '',                // 所选渠道
                        status: '',                 // 所选状态
                        start_time: '',             // 开始时间
                        end_time: ''                // 结束时间
                    },
                    channelList: [],                // 渠道列表
                    dataList: [],                   // 开店记录列表
                    total: '',                      // 列表总数量
                    settlementMoney: '222'             // 结算金额
                },
                created: function () {
                    this.ajaxChannel();
                },
                mounted: function () {
                    $('#openShopHistory').show();

                    this.dateTimerPick();
                },
                updated: function () {

                    var n = $('#historyList').find('tr.list').length;
                    if (this.total && this.total != 0) {
                        $('.pagination-info').html('<span>当前' + n + '条</span>/<span>共' + this.total + '条</span>')
                    } else {
                        $('.pagination-info').html('<span>当前0条</span>/<span>共' + this.total + '条</span>')
                    }

                    this.icheck();
                },
                methods: {

                    /**
                     * 搜索
                     */
                    searchInformation: function () {
                        var _self = this;

                        console.log(this.searchValue.name + this.searchValue.channel);

                        // todo 把搜索内容赋值到search_key
                        that.search_key.keywords = this.searchValue.name;

                        that.getData(function (res) {
                            _self.dataList = res.data.data;
                            _self.total = res.data.total_count;
                        })
                    },

                    /**
                     * 导出开店记录
                     */
                    exportHistroy: function () {
                        toastr.info('导出功能敬请期待!','提示')
                    },

                    /**
                     * 请求渠道列表
                     */
                    ajaxChannel: function () {
                        var _self = this;

                        that.getChannelList(function (res) {
                            _self.channelList = res.data.data;
                        });

                        that.getData(function (res) {
                            _self.dataList = res.data.data;
                            _self.total = res.data.total_count;
                        });
                    },

                    /**
                     * 结算
                     * @param e
                     * @param currentData
                     */
                    settlementFunc: function (e, currentData) {
                        var target = e.currentTarget;
                        var id = currentData.id;
                        var status = currentData.status;
                        var name = currentData.storage_name;
                        var _self = this;
                        that.tip({
                            target: target,
                            width: 250,
                            content: '<div class="form-group">' +
                            '<label class="ui-label-sm ui-label tr">结算金额：</label>' +
                            '<input class="form-control form-control-sm" id="settlementMoney" value="' + _self.settlementMoney + '">' +
                            '</div>'
                        }, function (btn, dialog) {
                            if (_self.validate($('#settlementMoney').val())) {
                                toastr.error('输入的结算金额非法,请重新输入~','提示');
                                return false
                            } else {
                                toastr.success((status == 1 ? '关闭' : '激活') + '成功!', '提示');
                                for (var i = 0; i < _self.dataList.length; i++) {
                                    if (_self.dataList[i].id == id) {
                                        _self.dataList[i].status = (status == 1 ? 2 : 1);
                                    }
                                }
                            }
                            dialog.close();
                        }, function (btn, dialog) {
                            dialog.close();
                        })
                    },

                    /**
                     * 批量结算
                     * @param e
                     */
                    batchSettlementFunc: function (e) {
                        var target = e.currentTarget;
                        var _self = this;
                        var idList = [];
                        var checkedBox = $('.checkbox:checked');
                        if (checkedBox.length <= 0) {
                            toastr.error('请至少选择一个要结算的记录~', '提示');
                            return;
                        }
                        for (var i = 0; i < checkedBox.length; i++) {
                            idList.push(checkedBox.eq(i).attr('data-id'));
                        }

                        console.log(idList);
                        that.tip({
                            target: target,
                            width: 250,
                            position: 'right',
                            content: '<div class="form-group">' +
                            '<label class="ui-label-sm ui-label tr">结算金额：</label>' +
                            '<input class="form-control form-control-sm" id="settlementMoney" value="' + _self.settlementMoney + '">' +
                            '</div>'
                        }, function (btn, dialog) {
                            if (_self.validate($('#settlementMoney').val())) {
                                toastr.error('输入的结算金额非法,请重新输入~','提示');
                                return false
                            } else {
                                toastr.success((status == 1 ? '关闭' : '激活') + '成功!', '提示');
                                for (var i = 0; i < _self.dataList.length; i++) {
                                    if (_self.dataList[i].id == id) {
                                        _self.dataList[i].status = (status == 1 ? 2 : 1);
                                    }
                                }
                            }
                            dialog.close();
                        }, function (btn, dialog) {
                            dialog.close();
                        })
                    },

                    /**
                     * 排序
                     */
                    orderBy: function (e, orderBy) {
                        console.log(orderBy);
                        if (this[orderBy.type] && this[orderBy.type].value == 1) {
                            // 0
                            this[orderBy.type].asc = true;
                            this[orderBy.type].desc = false;
                            this[orderBy.type].value = 0;
                        } else {
                            // 1
                            this[orderBy.type].asc = false;
                            this[orderBy.type].desc = true;
                            this[orderBy.type].value = 1;
                        }
                    },

                    /**
                     * 时间选择插件
                     */
                    dateTimerPick: function () {
                        var _self = this;
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
                            _self.searchValue.start_time = start.format('YYYY-MM-DD');
                            _self.searchValue.end_time = end.format('YYYY-MM-DD');
                        });

                        $('#timepicker').on('cancel.daterangepicker', function (ev, picker) {
                            $(this).find('span').text('请选择相应的时间');
                            _self.searchValue.start_time = '';
                            _self.searchValue.end_time = '';
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
                     * icheck
                     */
                    icheck: function () {
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
                     * 验证
                     */
                    validate: function (value) {
                        var money = /^\d+(\.\d{1,2})?$/;
                        if (!money.test(value)) {
                            return true
                        }
                        return false
                    }
                }
            });
        },

        /**
         * 渠道
         * @param cb
         */
        getChannelList: function (cb) {
            var that = this;
            Api.get({
                url: '/channel/control/query.do',
                data: {
                    current_page: that.pageId,
                    pageSize: 1000
                },
                beforeSend: function () {

                },
                success: function (res) {
                    cb && cb(res)
                },
                complete: function () {

                },
                error: function () {
                    toastr.error(data.msg, '提示');
                }
            })
        },

        /**
         * 开店记录列表接口
         * @param cb
         */
        getData: function (cb) {
            var that = this;
            Api.get({
                url: '/storage/query.do',
                data: {
                    storage_qto: JSON.stringify({
                        current_page: that.pageId || 1,
                        page_size: that.page.pageSize || 20,
                        need_paging: true,
                        keywords: that.search_key.keywords
                    })
                },
                mask: true,
                beforeSend: function () {

                },
                success: function (data) {
                    cb && cb(data);
                    that.pagination(data.data.total_count);
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },

        /**
         * 翻页
         * @param total - 总页数
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
                        that.getData()
                    }
                }
            });
            $('#check-all').iCheck("uncheck");
        }
    };
    // run
    $(function () {
        main.init();
    })
})();
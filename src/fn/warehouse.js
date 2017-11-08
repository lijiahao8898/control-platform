/**
 * 仓库功能
 * 添加仓库 / 仓库查询 / 仓库删除
 */
;(function () {
    var main = {
        init: function () {
            this.page = {};
            this.page.pageSize = 20;
            this.page.vpage = 10;
            this.pageId = 1;
            this.search_key = {};
            this.addEvent();
            this.queryWarehouse();
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
        addEvent: function () {
            var that = this;

            // iCheck
            $(document).on('ready', function () {
                that.iCheck();
            });

            // search
            $('#search').click(function () {
                that.search_key.keywords = $.trim($('#keywords').val());
                that.pageId = 1;
                that.queryWarehouse();
            });

            // batch delete
            $('#batchDelete').click(function () {
                var checkedBox = $('.checkbox:checked');
                var idList = [];
                for (var i = 0; i < checkedBox.length; i++) {
                    idList.push(checkedBox.eq(i).attr('data-id'));
                }
                if(checkedBox.length <=0){
                    toastr.error('请至少选择一个要删除的仓库~', '提示');
                    return;
                }
                that.tip({
                    target: $(this),
                    content: '确定要批量删除仓库吗?'
                }, function (btn, dialog) {

                    console.log(idList);
                    that.deleteWarehouse(idList, function (data) {
                        toastr.success('已成功批量删除', '提示');
                        that.queryWarehouse();
                    }, function (data) {
                        toastr.error(data.msg)
                    });

                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // delete
            $(document).on('click', '.j-warehouse-delete', function () {
                var id = $(this).attr('data-id');
                var name = $(this).attr('data-name');
                var idList = [];
                idList.push(id);
                that.tip({
                    target: $(this),
                    content: '确定要删除仓库' + name + '吗?'
                }, function (btn, dialog) {

                    console.log(idList);
                    that.deleteWarehouse(idList, function (data) {
                        toastr.success('已成功删除' + name, '提示');
                        that.queryWarehouse();
                    }, function (data) {
                        toastr.error(data.msg)
                    });

                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 关闭 & 激活
            $(document).on('click', '.j-warehouse-freeze', function () {
                var id = $(this).attr('data-id');
                var status = $(this).attr('data-status');
                var name = $(this).attr('data-name');
                var idList = [];
                idList.push(id);
                that.tip({
                    target: $(this),
                    content: status == 2 ? ('确定要关闭' + name + '吗?') : ('确定要激活' + name + '吗?')
                }, function (btn, dialog) {

                    console.log(idList);
                    that.freezeWarehouse(idList, status, function () {

                        var msg = (status == 2 ? ('已成功关闭' + name) : ('已成功激活' + name));
                        toastr.success(msg, '提示');
                        that.queryWarehouse();

                    }, function () {

                    });

                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                })
            });

            // 批量关闭
            $('#batchFreeze').click(function () {
                var checkedBox = $('.checkbox:checked');
                var idList = [];
                for (var i = 0; i < checkedBox.length; i++) {
                    idList.push(checkedBox.eq(i).attr('data-id'));
                }
                if(checkedBox.length <=0){
                    toastr.error('请至少选择一个要关闭的仓库~', '提示');
                    return;
                }
                var status = 2;
                that.tip({
                    target: $(this),
                    content: '确定要批量关闭仓库吗?'
                }, function (btn, dialog) {

                    console.log(idList);
                    that.freezeWarehouse(idList, status, function () {
                        toastr.success('已成功批量关闭仓库', '提示');
                        that.queryWarehouse();
                    }, function () {

                    });

                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 批量激活
            $('#batchunFreeze').click(function () {
                var checkedBox = $('.checkbox:checked');
                var idList = [];
                for (var i = 0; i < checkedBox.length; i++) {
                    idList.push(checkedBox.eq(i).attr('data-id'));
                }
                if(checkedBox.length <=0){
                    toastr.error('请至少选择一个要激活的仓库~', '提示');
                    return;
                }
                var status = 1;
                that.tip({
                    target: $(this),
                    content: '确定要批量激活仓库吗?'
                }, function (btn, dialog) {

                    console.log(idList);
                    that.freezeWarehouse(idList, status, function () {
                        toastr.success('已成功批量激活仓库', '提示');
                        that.queryWarehouse();
                    }, function () {

                    });

                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });
        },
        /**
         * 仓库列表
         */
        queryWarehouse: function () {
            var that = this;
            Api.get({
                url: '/storage/query.do',
                data: {
                    storage_qto: JSON.stringify({
                        keywords: that.search_key.keywords,
                        current_page: that.pageId || 1,
                        page_size: that.page.pageSize || 20,
                        need_paging: true
                    })
                },
                mask: true,
                beforeSend: function () {

                },
                success: function (data) {
                    // 滚动条自动回顶部
                    //document.getElementsByTagName('body')[0].scrollTop = 0;
                    var total_count = data.data.total_count;
                    if (total_count > 0) {
                        var t = _.template($('#j-template-warehouse').html());
                        $('#warehouseList').html(t({
                            items: data.data.data
                        }));
                        that.iCheck();
                    } else {
                        $('#warehouseList').html('<tr><td class="tc" colspan="17">没有任何记录!</td></tr>')
                    }

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
         * 激活 & 关闭仓库
         */
        freezeWarehouse: function (idList, status, success, error) {
            var that = this;
            Api.get({
                url: '/storage/change_status.do',
                data: {
                    id_list: JSON.stringify(idList),
                    status: status
                },
                beforeSend: function () {

                },
                success: function (data) {
                    success && success(data);
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                    toastr.error(data.msg);
                    error && error(data);
                }
            });
        },
        /**
         * 删除仓库
         * /storage/change_status.do
         */
        deleteWarehouse: function (idList, success, error) {
            var that = this;
            Api.get({
                url: '/storage/delete.do',
                data: {
                    id_list: JSON.stringify(idList)
                },
                beforeSend: function () {

                },
                success: function (data) {
                    success && success(data);
                },
                complete: function () {

                },
                error: function (data, msg) {
                    console.log(data, msg);
                    error && error(data);
                }
            });
        },
        pagination: function (total) {
            var that = this;
            var pagination = $('.ui-pagination')
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
                        that.queryWarehouse()
                    }
                }
            });
            $('#check-all').iCheck("uncheck");
            var n = $('#warehouseList').find('tr.list').length;
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
/**
 * Created by kyn on 17/3/1.
 */
;(function () {
    var main = {
        init: function () {
            this.paginationCfg = {
                pageSize: 20,
                pageId: 1,
                visiblePages: 10
            };
            this.search_key = {};
            this.getData();
            this.addEvent();

        },
        /**
         * tip
         * @param data
         * @param success
         * @param fail
         */
        tip: function (data, success, fail) {
            var dialogTip = jDialog.tip(data.content, {
                target: data.target,
                position: data.position || 'left'
            }, {
                width: 200,
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
        // 请求渲染接口
        getData: function () {
            var that = this;
            Api.get({
                url: "/employee/query.do",
                data: {
                    current_page: that.paginationCfg.pageId || '1',
                    page_size: that.paginationCfg.pageSize,
                    user_name: that.search_key.user_name || '',
                    name: that.search_key.name || '',
                    status: that.search_key.status || ''
                },
                mask: true,
                success: function (data) {
                    var total_count = data.data.total_count;
                    if( total_count > 0 ){
                        var $tpl1 = $("#tpl").html();
                        $("#j-list").html(_.template($tpl1)({
                            data: data.data.data
                        }));
                        that.iCheck();
                        that.pagination(total_count)
                    }else{
                        $('#j-list').html('<tr><td class="tc" colspan="20">没有任何记录!</td></tr>')
                    }
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            })
        },

        addEvent: function () {
            var that = this;

            // 搜索
            $('#j-search').click(function () {
                that.paginationCfg.pageId = 1;
                that.search_key.name = $.trim($('#name').val());
                that.search_key.user_name = $.trim($('#userName').val());
                that.search_key.status = $('#status').val() == 'null' ? '' : $('#status').val()
                that.getData();
            });

            // 删除
            $("body").on("click", ".j-del", function () {
                var id = $(this).attr("data-id");
                var name = $(this).attr('data-name');
                var config = {};
                config.target = $(this);
                config.content = '确定要删除管理员&nbsp;‘' + name + '’&nbsp;吗？';
                that.tip(config, function (btn, dialog) {
                    that.accountDelete(id);
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 启用&禁用
            $('body').on('click', '.j-freeze', function (e) {
                e.preventDefault();
                var id = $(this).attr('data-id');
                var name = $(this).attr('data-name');
                var status = $(this).attr('data-status');
                var statusType;

                if (status == 0) {              // 启用
                    statusType = '启用';
                } else if (status == 1) {        // 禁用
                    statusType = '禁用';
                }

                var config = {};
                config.content = '确定要' + statusType + '管理员&nbsp;‘' + name + '’&nbsp;吗？';
                config.target = $(this);
                that.tip(config, function (btn, dialog) {
                    dialog.close();
                    that.freeze(id, status, statusType);
                }, function (btn, dialog) {
                    dialog.close();
                })

            });

            // 批量删除
            //$("body").on("click", "#batchDelete", function () {
            //    var $checked = $("input:checked");
            //    var arr = [];
            //    var data = {};
            //    data.target = $(this);
            //    data.content = '确定要批量删除吗?';
            //    for (var i = 0; i < $checked.length; i++) {
            //        if ($checked.eq(i).attr("data-id")) {
            //            arr.push($checked.eq(i).attr("data-id"))
            //        }
            //    }
            //    that.tip(data, function (btn, dialog) {
            //        that.batchDelete(arr, function (data) {
            //            toastr.success('已成功删除', '提示');
            //            that.render();
            //        }, function (data) {
            //            toastr.error(data.msg)
            //        });
            //        dialog.close();
            //    }, function (btn, dialog) {
            //        dialog.close();
            //    });
            //
            //})
        },

        /**
         * icheck定义
         */
        iCheck: function () {
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
        //分页
        pagination: function (total) {
            var that = this;
            var pagination = $('.pagination');
            pagination.jqPaginator({
                totalCounts: total == 0 ? 1 : total, // 设置分页的总条目数
                pageSize: that.paginationCfg.pageSize,                          // 设置每一页的条目数
                visiblePages: that.paginationCfg.visiblePages,                  // 设置最多显示的页码数
                currentPage: that.paginationCfg.pageId,                         // 设置当前的页码
                first: '<a class="first" href="javascript:;">&lt;&lt;<\/a>',
                prev: '<a class="prev" href="javascript:;">&lt;<\/a>',
                next: '<a class="next" href="javascript:;">&gt;<\/a>',
                last: '<a class="last" href="javascript:;">&gt;&gt;<\/a>',
                page: '<a href="javascript:;">{{page}}<\/a>',
                onPageChange: function (num, type) {
                    if (type == 'change') {
                        that.paginationCfg.pageId = num;
                        that.render();
                    }
                }
            });
            var n = $('#j-list').find('tr.list').length;
            if (total && total != 0) {
                $('.pagination-info').html('<span>当前' + n + '条</span>/<span>共' + total + '条</span>')
            } else {
                $('.pagination-info').html('<span>当前0条</span>/<span>共' + total + '条</span>')
            }
        },
        // 删除账号
        accountDelete: function (id) {
            var that = this;
            Api.get({
                url: '/employee/delete.do',
                data: {
                    id: id
                },
                success: function (data) {
                    toastr.success('删除成功', '提示');
                    that.getData();
                },
                error: function (data) {
                    toastr.error(data.msg, '提示')
                }
            })
        },
        // 禁用&启用账号
        freeze: function (id, status, statusType) {
            var that = this;
            var url;
            if( status  == 0 ){
                url = '/employee/thaw.do'
            }else{
                url = '/employee/freeze.do'
            }
            Api.get({
                url: url,
                data: {
                    employee_id: id
                },
                success: function (data) {
                    toastr.success(statusType + '成功', '提示');
                    that.getData();
                },
                error: function (data) {
                    toastr.error(data.msg, '提示')
                }
            })
        }
    };
    $(function () {
        main.init()
    })
})();

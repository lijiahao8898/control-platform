;(function () {
    var main = {
        init: function () {
            this.page = {};
            this.page.pageSize = 20;
            this.page.vpage = 10;
            this.pageId = 1;
            this.search_key = {};
            this.addEvent();
            this.queryBrand();
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

            // search
            $('#search').click(function () {
                that.search_key = $.trim($('#keywords').val());
                that.pageId = 1;
                that.queryBrand();
            });

            $('#batchDelete').click(function () {
                var checkedBox = $('.checkbox:checked');
                var idList = [];
                for (var i = 0; i < checkedBox.length; i++) {
                    idList.push(checkedBox.eq(i).attr('data-id'));
                }
                if (checkedBox.length <= 0) {
                    toastr.error('请至少选择一个要删除的商品~', '提示');
                    return;
                }
                var data = {};
                data.target = $(this);
                data.content = '确定要批量删除品牌吗?';
                that.tip(data, function (btn, dialog) {
                    console.log(idList);

                    that.deleteBrand(idList, function (data) {
                        toastr.success('已成功批量删除', '提示');
                        that.queryBrand();
                    }, function (data) {
                        toastr.error(data.msg)
                    });

                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // delete
            $(document).on('click', '.j-brand-delete', function () {
                var id = $(this).attr('data-id');
                var name = $(this).attr('data-name');
                var idList = [];
                idList.push(id);
                that.tip({
                    target: $(this),
                    content: '确定要删除品牌' + name + '吗?'
                }, function (btn, dialog) {
                    that.deleteBrand(idList, function (data) {

                        toastr.success('已成功删除' + name, '提示');
                        that.queryBrand();

                    }, function (data) {
                        toastr.error(data.msg)
                    });
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            })
        },
        /**
         * 品牌列表
         */
        queryBrand: function () {
            var that = this;
            Api.get({
                url: '/brand/query.do',
                data: {
                    current_page: that.pageId || 1,
                    page_size: that.page.pageSize || 20,
                    keywords: that.search_key || ''
                },
                mask: true,
                beforeSend: function () {

                },
                success: function (data) {
                    // 滚动条自动回顶部
                    document.getElementsByTagName('body')[0].scrollTop = 0;
                    var total_count = data.data.total_count;
                    if (total_count > 0) {
                        var t = _.template($('#j-template').html());
                        $('#brandList').html(t({
                            items: data.data.data
                        }));
                        that.iCheck();
                    } else {
                        $('#brandList').html('<tr><td class="tc" colspan="7">没有任何记录!</td></tr>')
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
         * 删除品牌
         */
        deleteBrand: function (idList, success, error) {
            var that = this;
            Api.get({
                url: '/brand/delete.do',
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
                        that.queryBrand()
                    }
                }
            });
            $('#check-all').iCheck("uncheck");
            var n = $('#brandList').find('tr.list').length;
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
;(function () {
    var main = {
        init: function () {
            this.page = {};
            this.page.pageSize = 20;
            this.page.vpage = 10;
            this.pageId = 1;
            this.search_key = {};
            this.categoryList = [];
            this.brandList = [];
            this.selectedList = [];
            this.idList = JSON.parse(decodeURIComponent(HDL.getQuery('id').split(',')));

            this.channelNum();
            this.addEvent();
            this.queryBrand();
            this.queryCategory();
            this.selectPluginBrand();
            this.selectPluginGoods();
            this.selectPluginCategory();
        },
        channelNum: function () {
            if (!this.idList) {
                toastr.error('供应商信息出错!', '提示');
                return false;
            } else {
                $('.channel-name-list').show();
                var template = _.template($('#j-template-channel-list').html());
                $('.channel-name-lists').html(template({
                    items: this.idList
                }))
                if (this.idList.length > 1) {
                    // 多个供应商
                    this.isSingle = false;
                } else {
                    // 单个供应商
                    this.isSingle = true;
                    // todo 单个供应商需要请求已经关联的商品列表
                    $('.channel-goods-list').show();
                    this.queryAssociatedGoodsList()
                }
            }
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
        /**
         * 调用弹窗选择插件
         * 选择商品
         */
        selectPluginGoods: function () {
            var that = this;
            $('#selectPluginGoods').selectPlugin({
                single: false,
                isSku: false,
                isSelectAll: true,
                type: 0,
                title: '商品选择',
                selectLength: 0,
                selectedList: that.selectedList,
                ajaxUrl: Api.domain() + '/control/item/query.do',
                ajaxType: 'get',
                ajaxDataType: 'jsonp',
                categoryList: that.categoryList || [],
                brandList: that.brandList || [],
                showCateAndBrand: true,
                selectSuccess: function (data) {
                    console.log(data);
                    var idList = [];
                    var postData = {};
                    for (var i = 0; i < data.length; i++) {
                        idList.push(data[i].id);
                    }
                    that.selectedList = idList;
                    postData.target_list = JSON.stringify(idList);
                    postData.type = 4;

                    if (that.isSingle === true) {
                        that.associatedGoods(postData, function () {
                            that.renderGoods();
                        });
                    } else {
                        that.associatedGoods(postData, function () {

                        })
                    }
                },
                selectError: function (info) {
                }
            })
        },
        /**
         * 调用弹窗选择插件
         * 选择品牌
         */
        selectPluginBrand: function () {
            var that = this;
            $('#selectPluginBrand').selectPlugin({
                single: false,
                isSku: false,
                isSelectAll: true,
                type: 4,
                title: '品牌选择',
                selectLength: 0,
                selectedList: that.selectedList,
                ajaxUrl: Api.domain() + '/brand/query.do',
                ajaxType: 'get',
                ajaxDataType: 'jsonp',
                selectSuccess: function (data) {
                    console.log(data);
                    var idList = [];
                    var postData = {};
                    for (var i = 0; i < data.length; i++) {
                        idList.push(data[i].id);
                    }

                    that.selectedList = idList;
                    postData.target_list = JSON.stringify(idList);
                    postData.type = 2;

                    if (that.isSingle === true) {
                        that.associatedGoods(postData, function () {
                            that.renderGoods();
                        });
                    } else {
                        that.associatedGoods(postData, function () {

                        })
                    }
                },
                selectError: function (info) {
                }
            })
        },
        /**
         * 调用弹窗选择插件
         * 选择类目
         */
        selectPluginCategory: function () {
            var that = this;
            $('#selectPluginCategory').selectPlugin({
                single: false,
                isSku: false,
                isSelectAll: true,
                type: 5,
                title: '类目选择',
                selectLength: 0,
                selectedList: that.selectedList,
                ajaxUrl: Api.domain() + '/category/leaf/query.do',
                ajaxType: 'get',
                ajaxDataType: 'jsonp',
                selectSuccess: function (data) {
                    console.log(data);
                    var idList = [];
                    var postData = {};
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].cate_level == 2) {
                            idList.push(data[i].id);
                        }
                    }
                    that.selectedList = idList;
                    postData.target_list = JSON.stringify(idList);
                    postData.type = 3;

                    if (that.isSingle === true) {
                        that.associatedGoods(postData, function () {
                            that.renderGoods();
                        });
                    } else {
                        that.associatedGoods(postData, function () {

                        })
                    }
                },
                selectError: function (info) {
                }
            })
        },
        /**
         * 渲染商品列表
         */
        renderGoods: function () {
            var that = this;
            var template = _.template($('#j-template-goods').html());
            $('#goodsList').html(template({
                items: that.selectList
            }));
            // 恢复全选按钮的展示
            $('#check-all').iCheck("uncheck");
            that.iCheck();
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
            });

            $('#channel input[name=radio]').on('ifClicked', function () {
                var value = $(this).val();
                $('#channelButton a').hide();
                $('#channelButton a[data-value=' + value + ']').css({
                    display: 'inline-block'
                });
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
                var key = $.trim($('#keywords').val());
                if (key != '') {
                    that.search_key.keywords = key;
                } else {
                    delete that.search_key.keywords;
                }
                that.pageId = 1;
                that.queryAssociatedGoodsList();
            });

            // batch delete
            $('#batchDelete').click(function () {
                var checkedBox = $('.checkbox:checked');
                var idList = [];
                for (var i = 0; i < checkedBox.length; i++) {
                    idList.push(checkedBox.eq(i).attr('data-id'));
                }
                that.tip({
                    target: $(this),
                    content: '确定要批量取消关联已经选择的商品吗?',
                    position: 'right'
                }, function (btn, dialog) {

                    console.log(idList);
                    that.deleteAssociatedGoods(idList, function () {
                        toastr.success('已成功批量取消关联', '提示');
                        that.queryAssociatedGoodsList();
                    });

                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // delete
            $(document).on('click', '.j-channel-delete', function () {
                var id = $(this).attr('data-id');
                var name = $(this).attr('data-name');
                var idList = [];
                idList.push(id);
                that.tip({
                    target: $(this),
                    content: '确定要取消关联商品：' + name + '吗?'
                }, function (btn, dialog) {
                    that.deleteAssociatedGoods(idList, function () {
                        toastr.success('已成功取消关联：' + name, '提示');
                        that.queryAssociatedGoodsList();
                    }, function () {

                    });
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 编辑结算价
            $(document).on('click', '.j-edit-price', function () {
                var data = {};
                var name = $(this).attr('data-name');
                var id = $(this).attr('data-id');
                that.popup({
                    title: '结算价',
                    content: $('#j-template-sku').html(),
                    width: 800
                }, function () {
                    that.goodsSkuList(id, name)
                }, function (btn, dialog) {
                    // 点击确定
                    var input = $('.settlement-sku-input');
                    var item_id = input.eq(0).attr('data-item_id');
                    var obj = {};
                    var postData = {};
                    var price;
                    var decimal = /^\d+(\.\d{1,2})?$/;
                    for (var i = 0; i < input.length; i++) {
                        price = $.trim((input.eq(i).val() * 100).toFixed(0));
                        if (!decimal.test(price)) {
                            toastr.error('结算价价格的输入有误,无法提交~', '提示');
                            return;
                        }
                        obj[input.eq(i).attr('data-sku_id')] = price;
                    }
                    postData.biz_item_id = item_id;
                    postData.price_map = JSON.stringify(obj);
                    that.editSettlementPrice(postData, function (data) {
                        toastr.success('更改结算价成功!', '提示');
                        dialog.close();
                    }, function (data) {
                        toastr.error(data.msg, '提示');
                        dialog.close();
                    })
                })
            });

            // 删除渠道商
            $(document).on('click', '.j-image-close', function () {
                var id = $(this).attr('data-id');
                if ($('.channel-detail').length <= 1) {
                    toastr.error('当前渠道只剩一个了~');
                    return false;
                }
                for (var i = 0; i < that.idList.length; i++) {
                    if (id == that.idList[i].id) {
                        that.idList.splice(i, 1);
                        if (i >= 1) {
                            i--
                        }
                    }
                }
                $(this).parents('.channel-detail').remove();
                that.channelNum();
            });

            // 关联全部
            $('#selectAll').click(function () {
                that.tip({
                    target: $(this),
                    content: '确定要关联全部商品吗?',
                    position: 'right'
                }, function (btn, dialog) {
                    var postData = {};
                    postData.type = 1;
                    if (that.isSingle === true) {
                        that.associatedGoods(postData, function () {

                        });
                    } else {
                        that.associatedGoods(postData, function () {

                        });
                    }

                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                })
            })
        },

        /**
         * 关联商品
         * @param postData
         * @param cb
         */
        associatedGoods: function (postData, cb) {
            var that = this;
            var channel_list = [];
            for (var i = 0; i < this.idList.length; i++) {
                channel_list.push(this.idList[i].id);
            }
            postData.channel_list = JSON.stringify(channel_list);
            console.log(postData);
            Api.get({
                url: '/item/bind_channel.do',
                data: postData,
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        toastr.success('关联中,关联进度请查看关联列表<a style="color:blue;" href="channel-goods.html">点击</a>', '提示');
                        cb && cb();
                    } else {
                        toastr.error(data.msg, '提示');
                    }
                },
                complete: function () {
                    that.selectedList.splice(0, that.selectedList.length);
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },

        /**
         * 品牌列表
         */
        queryBrand: function () {
            var that = this;
            Api.get({
                url: '/brand/query.do',
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var brand = data.data.data;
                    for (var i = 0; i < brand.length; i++) {
                        that.brandList.push({
                            text: brand[i].brand_name,
                            value: brand[i].id
                        });
                    }
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },

        /**
         * 类目列表
         */
        queryCategory: function () {
            var that = this;
            Api.get({
                url: '/category/query.do',
                data: {},
                beforeSend: function () {

                },
                success: function (data) {
                    var cate = data.data;
                    for (var i = 0; i < cate.length; i++) {
                        if (cate[i].cate_level == 2) {
                            that.categoryList.push({
                                text: cate[i].cate_name,
                                value: cate[i].id
                            });
                        }
                    }
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },

        /**
         * sku
         */
        goodsSkuList: function (id, name) {
            var that = this;
            Api.get({
                url: '/biz_item/get_sku.do',
                data: {
                    biz_item_id: id
                },
                beforeSend: function () {

                },
                success: function (data) {
                    console.log(data);
                    var template = _.template($('#j-template-sku-table').html());
                    $('#skuList').html(template({
                        items: data.data,
                        name: name
                    }))
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },

        /**
         * 已经关联的商品列表
         */
        queryAssociatedGoodsList: function (id) {
            var that = this;
            Api.get({
                url: '/biz_item/query.do',
                data: {
                    biz_item_qto: JSON.stringify({
                        biz_code: that.idList[0].biz_code,
                        need_paging: true,
                        page_size: that.page.pageSize,
                        current_page: that.pageId,
                        keywords: that.search_key.keywords,
                        from: 1                         // 展示管控的渠道已经关联的商品
                    })
                },
                beforeSend: function () {

                },
                success: function (data) {
                    var template = _.template($('#j-template-goods').html());
                    $('#goodsList').html(template({
                        items: data.data.data
                    }));
                    that.pagination(data.data.total_count);
                    that.iCheck();
                },
                complete: function () {

                },
                error: function (data, msg) {
                    toastr.error(data.msg)
                }
            });
        },

        /**
         * 取消已关联的商品
         */
        deleteAssociatedGoods: function (idList, success, error) {
            var that = this;
            Api.get({
                url: '/biz_item/delete.do',
                data: {
                    id_list: JSON.stringify(idList),
                    channel_id: that.idList[0].id
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

        /**
         * 编辑结算价
         */
        editSettlementPrice: function (data, success, error) {
            var that = this;
            Api.get({
                url: '/biz_item/update_settlement_price.do',
                data: data,
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
                        that.queryAssociatedGoodsList()
                    }
                }
            });
            $('#check-all').iCheck("uncheck");
            var n = $('#goodsList').find('tr.list').length;
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
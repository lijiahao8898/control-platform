/**
 * Created by lijiahao on 17/1/9.
 */
;(function () {
    var main = {
        init: function () {
            this.page = {};
            this.page.pageSize = 20;
            this.page.vpage = 10;
            this.pageId = 1;
            this.search_key = {};
            this.categoryId = '';
            this.currentCateObj = {};
            this.warehouseList = [];
            $('#categoryChildren').hide();
            this.queryGoods();
            this.addEvent();
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
            var that = this;
            var validator = new FormValidator();
            validator.settings.alerts = true;

            // 搜索
            $('#search').click(function () {
                that.pageId = 1;

                var brand_key = $.trim($('#brandList option:selected').attr('value'))
                if (brand_key != '') {
                    that.search_key.brand_key = brand_key;
                }
                var category_id = that.currentCateObj['2'] ? that.currentCateObj['2'].id : '';
                if (category_id != '') {
                    that.search_key.category_id = category_id
                }
                var key = $.trim($('#key').val());
                if (key != '') {
                    that.search_key.key = key;
                }
                var freeze = $('#freezeStatus').val();
                if (freeze != '') {
                    that.search_key.freeze = freeze
                }
                var delivery_type = $('#deliveryType').val();
                if (delivery_type != '') {
                    that.search_key.delivery_type = delivery_type;
                }
                that.queryGoods();
            });

            // tab
            $('#goodsTab li').click(function () {

                if ($(this).hasClass('active')) {
                    return false;
                }
                // 重置搜索状态
                that.search_key.item_status = $(this).attr('data-type');
                // 重置页码
                that.pageId = 1;
                if (that.search_key.item_status == -1) {
                    $('#j-batch-trash').hide();
                    $('#j-batch-restore,#j-batch-delete').show();
                } else {
                    $('#j-batch-trash').show();
                    $('#j-batch-restore,#j-batch-delete').hide();
                }
                that.queryGoods();
            });

            // 加入回收站
            $(document).on('click', '.j-trash', function () {
                var data = {};
                var name = $(this).attr('data-name');
                var id = $(this).attr('data-id');
                var idList = [];
                idList.push(id);
                data.target = $(this);
                data.content = '确定要将商品:' + name + '加入回收站吗?';
                that.tip(data, function (btn, dialog) {
                    that.batchTrashGoods(JSON.stringify(idList));
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 批量加入回收站
            $(document).on('click', '#j-batch-trash', function () {
                var data = {};
                var idList = [];
                var checkedBox = $('.checkbox:checked');
                for (var i = 0; i < checkedBox.length; i++) {
                    idList.push(checkedBox.eq(i).attr('data-id'));
                }
                data.target = $(this);
                data.content = '确定要将选中的商品加入回收站吗?';
                data.position = 'right';
                that.tip(data, function (btn, dialog) {
                    that.batchTrashGoods(JSON.stringify(idList));
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 删除
            $(document).on('click', '.j-delete', function () {
                var data = {};
                var name = $(this).attr('data-name');
                var id = $(this).attr('data-id');
                var idList = [];
                idList.push(id);
                data.target = $(this);
                data.content = '确定要将商品:' + name + '彻底删除吗?';
                that.tip(data, function (btn, dialog) {
                    that.batchDeleteGoods(JSON.stringify(idList));
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 批量删除
            $(document).on('click', '#j-batch-delete', function () {
                var data = {};
                var idList = [];
                var checkedBox = $('.checkbox:checked');
                for (var i = 0; i < checkedBox.length; i++) {
                    idList.push(checkedBox.eq(i).attr('data-id'));
                }
                data.target = $(this);
                data.content = '确定要将选中的商品彻底删除吗?';
                data.position = 'right';
                that.tip(data, function (btn, dialog) {
                    that.batchDeleteGoods(JSON.stringify(idList));
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 恢复
            $(document).on('click', '.j-restore', function () {
                var data = {};
                var name = $(this).attr('data-name');
                var id = $(this).attr('data-id');
                var idList = [];
                idList.push(id);
                data.target = $(this);
                data.content = '确定要将商品:' + name + '恢复吗?';
                that.tip(data, function (btn, dialog) {
                    that.batchRecoveryGoods(JSON.stringify(idList));
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 批量恢复
            $(document).on('click', '#j-batch-restore', function () {
                var data = {};
                var idList = [];
                var checkedBox = $('.checkbox:checked');
                for (var i = 0; i < checkedBox.length; i++) {
                    idList.push(checkedBox.eq(i).attr('data-id'));
                }
                data.target = $(this);
                data.content = '确定要将选中的商品全部恢复吗?';
                data.position = 'right';
                that.tip(data, function (btn, dialog) {
                    that.batchRecoveryGoods(JSON.stringify(idList));
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 冻结
            $(document).on('click', '.j-freeze', function () {
                var name = $(this).attr('data-name');
                var id = $(this).attr('data-id');
                var freeze = $(this).attr('data-freeze') == '2' ? '1' : '2';

                that.tip({
                    target: $(this),
                    content: freeze == '2' ? '确定要将商品:' + name + '冻结吗?' : '确定要将商品:' + name + '解冻吗?'
                }, function (btn, dialog) {
                    that.freeze(id, freeze);
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 成本价goodsSkuList
            $(document).on('click', '.j-edit-cost-price', function () {
                var data = {};
                var name = $(this).attr('data-name');
                var id = $(this).attr('data-id');
                data.title = '成本价';
                data.content = $('#j-template-sku').html();
                data.width = 800;
                that.popup(data, function () {
                    that.goodsSkuList(id, name)
                }, function () {

                })
            });

            // 提交
            $(document).on('click', '.j-submit', function () {
                var id = $(this).attr('data-item_id');
                var postData = [];
                if(that.verify(id) == false){
                    return;
                }
                for (var n = 0; n < $('.list-' + id).length; n++) {
                    var list = $('.list-' + id).eq(n);
                    var skuDetail = {
                        item_id: id,
                        id: list.attr('data-sku_id'),
                        supplier_cost: ($.trim(list.find('.price-so').val()) * 100).toFixed(0),
                        operating_cost: ($.trim(list.find('.price-ocr').val()) * 100).toFixed(0),
                        fxh_cost: ($.trim(list.find('.price-cost').val()) * 100).toFixed(0),
                        settlement_price: ($.trim(list.find('.price-settlement').val()) * 100).toFixed(0)
                    };
                    postData.push(skuDetail);
                }
                console.log(postData);
                that.tip({
                    target: $(this),
                    content: '确定要提交选择的商品吗?',
                    position: 'left'
                }, function (btn, dialog) {
                    if(that.verify(id)){
                        that.submitPrice(postData);
                    };
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 批量提交
            $(document).on('click', '#batchSubmit', function () {
                var postData = [];
                var checkedBox = $('.checkbox:checked');
                for (var i = 0; i < checkedBox.length; i++) {
                    var tr = checkedBox.eq(i);
                    var id = tr.attr('data-item_id');
                    if(that.verify(id) == false){
                        return;
                    }
                    for (var n = 0; n < $('.list-' + id).length; n++) {
                        var list = $('.list-' + id).eq(n);
                        var skuDetail = {
                            item_id: id,
                            id: list.attr('data-sku_id'),
                            supplier_cost: ($.trim(list.find('.price-so').val()) * 100).toFixed(0),
                            operating_cost: ($.trim(list.find('.price-ocr').val()) * 100).toFixed(0),
                            fxh_cost: ($.trim(list.find('.price-cost').val()) * 100).toFixed(0),
                            settlement_price: ($.trim(list.find('.price-settlement').val()) * 100).toFixed(0)
                        };
                        postData.push(skuDetail);
                    }
                }
                console.log(postData);
                that.tip({
                    target: $(this),
                    content: '确定要提交选择的商品吗?',
                    position: 'right'
                }, function (btn, dialog) {
                    that.submitPrice(postData);
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            $(document).on('blur', 'input[required]', function () {
                // required input validator 验证表单
                var required = $(this);
                for (var i = 0; i < required.length; i++) {
                    var result = validator.checkField.call(validator, required.eq(i));
                    if (result.valid === false) {
                        //isValid = false;
                        //toastr.error('价格填写不合法', '提示');
                        return;
                    }
                }
            });

            // 批量设置 - sku 显示批量的输入框
            $(document).on('click', '.j-batch', function () {
                var type = $(this).attr('data-type');
                $(this).hide();
                $('input[data-set_type]').hide();
                $('input[data-set_type=' + type + ']').show().focus();
            });

            // 批量设置 - sku - input
            $(document).on('keyup', 'input[data-set_type=1],input[data-set_type=2],input[data-set_type=3],input[data-set_type=4]', function () {
                var type = $(this).attr('data-set_type');
                if ($.trim($(this).val()) == '') {
                    return;
                }
                for (var i = 0; i < $('.checkbox:checked').length; i++) {
                    var item_id = $('.checkbox:checked').eq(i).attr('data-item_id');
                    $('.list-' + item_id).find('input[data-input_type=' + type + ']').val($(this).val()).change();
                }
            });

            // 批量设置 - sku - input
            $(document).on('blur', 'input[data-set_type=1],input[data-set_type=2],input[data-set_type=3],input[data-set_type=4]', function () {
                var type = $(this).attr('data-set_type');
                $(this).hide();
                $('.j-batch[data-type=' + type + ']').show();
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
         * 获取类目
         */
        queryCategory: function () {
            var that = this;
            Api.get({
                url: '/category/leaf/query.do',
                data: {},
                beforeSend: function (XMLHttpRequest) {
                },
                success: function (data) {
                    if (data.code === 10000) {
                        var template = _.template($('#j-template-category').html());

                        // 渲染一级类目
                        $('#add-goods-category-1').html(template({
                            items: data.data,
                            type: 1
                        }));

                        // 类目的点击事件
                        $(document).on('change', '.categories', function () {
                            var id = $(this).find('option:selected').attr('value');
                            var parent_id = $(this).find('option:selected').attr('data-parent_id');
                            var level = $(this).find('option:selected').attr('data-cate_level');
                            var subCate = $(this).find('option:selected').attr('data-sub_cate');

                            if (subCate && subCate != 'undefined') {
                                subCate = JSON.parse(decodeURIComponent(subCate));
                            }
                            if (id) {
                                $('#categoryChildren').show();
                            } else {
                                $('#categoryChildren').hide();
                                that.currentCateObj = {};
                            }
                            if (parent_id == 0) {
                                // 点击的是一级类目
                                // 一级类目移除active
                                that.categoryId = id;
                                $('#add-goods-category-2').html(template({
                                    items: subCate,
                                    type: 2
                                }));
                                that.currentCateObj = {};

                            } else {
                                // 点击的是二级类目
                                that.categoryId = parent_id;
                            }
                            that.currentCateObj[level] = {
                                id: id,
                                parent_id: parent_id,
                                level: level
                            };
                            console.log('cateOBJ:' + JSON.stringify(that.currentCateObj))
                        });
                    }
                },
                complete: function () {
                },
                error: function (data) {

                }
            })
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
                    var t = _.template($('#j-template-brand').html());
                    $('#brandList').html(t({
                        items: data.data.data
                    }));
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
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
                        need_paging: false
                    })
                },
                beforeSend: function () {

                },
                success: function (data) {
                    console.log(data);
                    var tax = data.data.data;
                    for (var i = 0; i < tax.length; i++) {
                        that.warehouseList.push({
                            text: tax[i].storage_name,
                            value: tax[i].storage_id
                        });
                    }
                    var selectize = $('#storage-template-selectize').selectize({
                        options: that.warehouseList,
                        placeholder: '请选择税仓库',
                        create: false,
                        onItemAdd: function (value, $item) {
                            // 选择税率模板
                            that.tax_key = value
                        },
                        onItemRemove: function (value) {
                            that.tax_key = ''
                        }
                    });
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 商品列表
         */
        queryGoods: function () {
            var that = this;
            Api.get({
                //absoluteUrl: '../src/stub/goods-sku-price.json',
                url: '/control/item/query.do',
                data: {
                    item_qto: JSON.stringify({
                        current_page: that.pageId || 1,
                        page_size: that.page.pageSize || 20,
                        keywords: that.search_key.key,
                        item_brand_id: that.search_key.brand_key,
                        category_id: that.search_key.category_id,
                        item_status: that.search_key.item_status,
                        freeze: that.search_key.freeze,
                        delivery_type: that.search_key.delivery_type,
                        need_detail: 1,
                        need_paging: true
                    })
                },
                mask: true,
                dataType: 'jsonp',
                beforeSend: function () {

                },
                success: function (data) {
                    console.log(data);
                    // 滚动条自动回顶部
                    document.getElementsByTagName('body')[0].scrollTop = 0;
                    var total_count = data.data.total_count;
                    if (total_count > 0) {
                        var t = _.template($('#j-template').html());
                        $('#goodsList').html(t({
                            items: data.data.data
                        }));
                        that.iCheck();
                    } else {
                        $('#goodsList').html('<tr><td class="tc" colspan="18">没有任何记录!</td></tr>')
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
         * 批量加入回收站
         */
        batchTrashGoods: function (idList) {
            var that = this;
            Api.get({
                url: '/item/trash.do',
                data: {
                    id_list: idList
                },
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('加入回收站成功', '提示');
                    that.queryGoods();
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 批量删除
         */
        batchDeleteGoods: function (idList) {
            var that = this;
            Api.get({
                url: '/item/delete.do',
                data: {
                    id_list: idList
                },
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('删除成功', '提示');
                    that.queryGoods();
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * 批量恢复
         */
        batchRecoveryGoods: function (idList) {
            var that = this;
            Api.get({
                url: '/item/recovery.do',
                data: {
                    id_list: idList
                },
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('恢复成功', '提示');
                    that.queryGoods();
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        freeze: function (id, freeze) {
            var that = this;
            Api.get({
                url: '/item/change_freeze.do',
                data: {
                    item_dto: JSON.stringify({
                        id: id,
                        freeze: freeze
                    })
                },
                beforeSend: function () {

                },
                success: function (data) {
                    if (data.code == 10000) {
                        var msg = freeze == '2' ? '冻结成功' : '解冻成功';
                        toastr.success(msg, '提示');
                        that.queryGoods();
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
                url: '/item/sku/query.do',
                data: {
                    item_id: id
                },
                beforeSend: function () {

                },
                success: function (data) {
                    console.log(data);
                    var template = _.template($('#j-template-sku-table').html());
                    $('#skuList').html(template({
                        items: data.data.skus,
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
         *
         */
        submitPrice: function (data) {
            var that = this;
            Api.post({
                url: '/item/update_price.do',
                data: {
                    sku_list: JSON.stringify(data)
                },
                beforeSend: function () {

                },
                success: function (data) {
                    console.log(data);
                    if (data.code == 10000) {
                        toastr.success('提交成功!', '提示')
                    }
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },

        verify: function (id) {
            var decimal = /^\d+(\.\d{1,2})?$/;
            for (var n = 0; n < $('.list-' + id).length; n++) {
                var list = $('.list-' + id).eq(n);
                var supplier_cost = $.trim(list.find('.price-so').val());
                var operating_cost = $.trim(list.find('.price-ocr').val());
                var fxh_cost = $.trim(list.find('.price-cost').val());
                var settlement_price = $.trim(list.find('.price-settlement').val());
                if(!(decimal).test(supplier_cost) || !(decimal).test(operating_cost) || !(decimal).test(fxh_cost) || !(decimal).test(settlement_price)){
                    toastr.error('内容为空或输入的内容不合法!', '提示');
                    return false;
                }
            }
            return true;
        },
        /**
         *
         * @param total
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
                        that.queryGoods()
                    }
                }
            });
            $('#check-all').iCheck("uncheck");
            var n = $('#goodsList').find('.list').length;
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
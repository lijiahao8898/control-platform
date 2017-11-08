/**
 * Created by kyn on 17/3/13.
 */
;(function () {
    var main = {
        init: function () {
            this.search_key = {};
            this.render();
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

            // 搜索
            $('#search').click(function () {
                that.search_key.keywords = $.trim($('#keywords').val());
                that.render();
            });

            // 复制
            $('body').on('click', '.J_copy', function (e) {
                e.preventDefault();
                var id = $(this).attr('data-id');
                var data = {
                    id: id
                };
                var config = {};
                config.content = '确定要复制该模板吗?';
                config.target = $(this);
                that.tip(config, function (btn, dialog) {
                    that.copyCarriageTpl(data);
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });
            // 删除模板按钮
            $('body').on('click', '.J_del', function (e) {
                e.preventDefault();
                var id = $(this).attr('data-id');
                var target = $(this);
                var content = '确定要删除该运费模板吗？';
                var position = 'left';
                that.popupDelTip(target, content, position, id);

            })
        },
        // 复制模板
        copyCarriageTpl: function (data) {
            var that = this;
            Api.get({
                url: "/freight/copy.do",
                data: data,
                success: function (d) {
                    toastr.success('复制成功', '提示');
                    that.render()
                },
                error: function (d) {
                    toastr.error(d.msg, '提示');
                }
            })
        },
        popupDelTip: function (target, content, position, id) {         //type 1多项删除 2 单项删除 3 改名
            var that = this;
            var dialog = jDialog.tip(content, {
                target: target,
                position: position
            }, {
                width: 200,
                closeable: false,
                closeOnBodyClick: true,
                buttonAlign: 'center',
                buttons: [{
                    type: 'highlight',
                    text: '确定',
                    handler: function (button, dialog) {
                        that.deleteCarriageTpl(id);
                        dialog.close()
                    }
                }, {
                    type: 'highlight',
                    text: '取消',
                    handler: function (button, dialog) {
                        dialog.close();
                    }
                }]
            });

        },
        // 删除模板
        deleteCarriageTpl: function (id) {
            var that = this;
            Api.get({
                url: '/freight/delete.do',
                data: {
                    id: id
                },
                success: function (data) {
                    toastr.success('删除成功', '提示');
                    that.render()
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        render: function () {
            var that = this;
            Api.get({
                url: "/freight/query.do",
                data: {
                    keywords: that.search_key.keywords
                },
                mask: true,
                success: function (data) {
                    if( data.data.freight_template_dto_list.length > 0 ){
                        that.templateShow(data)
                    }
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            })
        },
        templateShow: function (data) {
            var $tpl1 = _.template($("#j-template").html());
            console.log(data);
            $(".template-main").html($tpl1({
                data: data.data.freight_template_dto_list
            }));

        }
    };
    $(function () {
        main.init()
    })
})();
/**
 * Created by kyn on 17/3/1.
 */
;(function () {
    var main = {
        init: function () {
            this.render()
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
        addEvent: function () {
            var that = this;

            // 删除
            $("body").on("click", ".j-del", function () {
                var id = $(this).attr("data-id");
                var data = {};
                data.target = $(this);
                data.content = '确定要删除该角色吗?';
                that.tip(data, function (btn, dialog) {
                    that.roleDelete(id, function (data) {
                        toastr.success('已成功删除', '提示');
                        that.render();
                    }, function (data) {
                        toastr.error(data.msg)
                    });
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });
            // 批量删除
            $("body").on("click", "#batchDelete", function () {
                var $checked = $("input:checked");
                var data = {};
                data.target = $(this);
                data.content = '确定要批量删除吗?';
                var arr = [];
                for (var i = 0; i < $checked.length; i++) {
                    if ($checked.eq(i).attr("data-id")) {
                        arr.push($checked.eq(i).attr("data-id"))
                    }
                }
                that.tip(data, function (btn, dialog) {
                    that.batchDelete(arr, function (data) {
                        toastr.success('已成功删除', '提示');
                        that.render();
                    }, function (data) {
                        toastr.error(data.msg)
                    });
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            })

        },
        render: function () {
            var that = this;
            Api.get({
                url: "/userRole/query.do",
                mask: true,
                success: function (data) {
                    that.mainShow(data);
                    that.iCheck();
                },
                error: function (data) {
                    toastr.error(data.msg,'提示');

                }
            })
        },
        //页面渲染
        mainShow: function (data) {
            var that = this;
            var tpl = $("#tpl").html();
            $("#tpl-main").html(_.template(tpl)({
                data: data.data.data
            }));
            that.addEvent();
        },
        //角色删除
        roleDelete: function (id) {
            var that = this;
            Api.get({
                url: "/userRole/delete.do",
                data: {
                    id: id
                },
                success: function (data) {
                    toastr.success("删除成功", "提示");
                    that.render();
                },
                error: function () {
                    toastr.error("删除失败", "提示")
                }
            })
        },
        // 批量删除
        batchDelete: function (arr) {
            console.log(arr)
        }
    };
    $(function () {
        main.init()
    })
})();
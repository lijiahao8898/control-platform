/**
 * Created by kyn on 17/3/15.
 */
;(function () {
    var main = {
        init: function () {
            this.Verification();
            this.render();
        },
        //判断是否是修改
        isGetData: function () {
            var that = this;
            var id = window.location.search.split('=')[1];
            if (id == undefined || (window.location.search.indexOf('?id=') == -1)) {
            } else {
                that.getData(id);
            }
        },
        //获取数据
        getData: function (id) {
            var that = this;
            Api.get({
                url: "/userRole/get.do",
                data: {
                    id: parseInt(id)
                },
                mask: true,
                success: function (data) {
                    $(".name").val(data.data.role_name);
                    $(".explain").val(data.data.role_desc);
                    var arr = eval(data.data.role);
                    console.log(arr[1])
                    for (var i = 0; i < arr.length; i++) {
                        $("input[data-id=" + arr[i] + "]").prop("checked", true)
                    }
                    if ($("input[type='checkbox']").length == $("input:checked").length + 1) {
                        $("#check-all").prop("checked", true)
                    }
                    that.iCheck()

                },
                error: function () {
                    toastr.error('失败啦!');
                }
            })
        },
        render: function () {
            var that = this;
            if( !window.localStorage ){
                toastr.error('游览器不支持localStorage');
            }else{
                var arr = JSON.parse(localStorage.getItem('root_role'))
            }
            Api.get({
                url: "/baseMenu/permission/query.do",
                data: {
                    version: 1,
                    id_list: JSON.stringify(arr)
                },
                success: function (data) {
                    that.mainShow(data)
                },
                error: function () {

                }
            })
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
                var id = $(this).parents("tr").attr("data-parent_id");
                var sid = $(this).attr("data-id");
                //判断是否一级点击
                if ($(this).parents("tr").hasClass("j-parent")) {
                    if ($("[data-parent_id=" + sid + "]").find("input:checked").length == 0) {
                        $("[data-parent_id=" + sid + "]").eq(0).find("input").iCheck("check")
                    }
                } else if ($(this).parents("tr").hasClass("j-children")) {          //判断是否是二级点击
                    $("input[data-id=" + id + "]").iCheck("check");
                    if ($("[data-parent_id=" + sid + "]").find("input:checked").length == 0) {
                        $("[data-parent_id=" + sid + "]").eq(0).find("input").iCheck("check")
                    }
                } else if ($(this).parents("tr").hasClass("j-children-son")) {           //判断是否三级点击
                    var gsid = $(this).parents("tr").attr("data-grandpa_id");
                    $("input[data-id=" + id + "]").iCheck("check");
                    $("input[data-id=" + gsid + "]").iCheck("check");
                }

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

                var id = $(this).parents("tr").attr("data-parent_id");
                var sid = $(this).attr("data-id");
                //判断一级是否点击
                if ($(this).parents("tr").hasClass("j-parent")) {
                    $("[data-parent_id=" + sid + "]").find("input").iCheck("uncheck")
                    $("[data-grandpa_id=" + sid + "]").find("input").iCheck("uncheck")
                } else if ($(this).parents("tr").hasClass("j-children")) {               //判断是否是二级点击
                    $("[data-parent_id=" + sid + "]").eq(0).find("input").iCheck("uncheck");
                    if ($(".j-children[data-parent_id=" + id + "]").find("input:checked").length == 0) {
                        $("input[data-id=" + id + "]").iCheck("uncheck");
                    }
                } else if ($(this).parents("tr").hasClass("j-children-son")) {          //判断是否是三级点击
                    var gsid = $(this).parents("tr").attr("data-parent_id");
                    if ($(".j-children-son[data-parent_id=" + gsid + "]").find("input:checked").length == 0) {
                        $("input[data-id=" + gsid + "]").iCheck("uncheck")
                    }
                }
                if (checkbox.length == checkedBox.length) {
                    $('#check-all').iCheck("check");
                } else {
                    $('#check-all').iCheck("uncheck");
                }
                $(this).parents('tr').removeClass('selected');
            })
        },
        //验证
        Verification: function () {
            var that = this;
            var validator = new FormValidator();
            validator.settings.alerts = true;
            $('#j-submit').click(function () {
                var isValid = true;
                for (var i = 0; i < $('[required]').length; i++) {
                    var required = $('[required]');
                    var result = validator.checkField.call(validator, required.eq(i));
                    if (result.valid === false) {
                        isValid = false;
                    }
                }
                if (isValid == true) {
                    for (var i = 0; i < $(".checked").is("checked").length; i++) {
                        $("input:checked").eq(i)
                    }
                    var checkboxed = $('.checkbox:checked');
                    var idsArr = [];
                    for (var i = 0; i < checkboxed.length; i++) {
                        idsArr.push(checkboxed.eq(i).attr('data-id'))
                    }
                    var data = {
                        role: JSON.stringify(idsArr),
                        role_desc: $(".explain").val(),
                        role_name: $(".name").val()
                    };
                    var id = window.location.search.split('=')[1];
                    if (id == undefined || (window.location.search.indexOf('?id=') == -1)) {
                        that.submitData(data)

                    } else {
                        data.id = id;
                        that.changeData(data);
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
        tip: function (data, success, fail) {
            this.dialogTip = jDialog.tip(data.content, {
                target: data.target,
                position: data.position || 'left'
            }, {
                width: data.width || 200,
                closeable: false,
                closeOnBodyClick: data.closeOnBodyClick,
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

            // 取消
            $('#j-cancel').click(function () {
                var data = {};
                data.target = $(this);
                data.position = 'right';
                data.content = '未保存的数据将会丢失，确定要离开吗?';
                data.closeOnBodyClick = true;
                that.tip(data, function (btn, dialog) {
                    dialog.close();
                    location.href = 'system-role-management.html';
                }, function (btn, dialog) {
                    dialog.close();
                })
            });

            // 子菜单折叠和展现
            $(document).on('click', '.j-parent', function (e) {
                e.stopPropagation();
                var $this = $(this);
                var id = $(this).attr('data-id');
                if ($this.hasClass('j-show') == false) {
                    $this.parent().find('.j-children[data-parent_id=' + id + ']').show();
                    $this.toggleClass('j-show', true);
                    $this.find('.j-caret').removeClass('caret-right');
                    $this.find('.j-caret').addClass('caret-bottom')
                } else {
                    // 联动 ——————--------
                    $this.parent().find('.j-children[data-parent_id=' + id + ']').hide();
                    $this.parent().find('.j-children[data-parent_id=' + id + ']').removeClass('j-children-active');
                    $this.parent().find('.j-children[data-parent_id=' + id + ']').find('.j-caret').addClass('caret-right');
                    $this.parent().find('.j-children[data-parent_id=' + id + ']').find('.j-caret').removeClass('caret-bottom');
                    $this.parent().find('.j-children-son[data-grandpa_id=' + id + ']').hide();
                    // ------------------
                    $this.toggleClass('j-show', false);
                    $this.find('.j-caret').addClass('caret-right');
                    $this.find('.j-caret').removeClass('caret-bottom')
                }
            });
            // 二级导航点击请求对应的子页面
            $(document).on('click', '.j-children', function (e) {
                e.stopPropagation();
                var parent_id = $(this).attr('data-parent_id');
                var id = $(this).attr('data-id');
                var name = $(this).attr('data-name');
                var $this = $(this);
                if ($(this).hasClass('j-children-active')) {
                    //已经展开了则隐藏
                    $('.j-children-son[data-parent_id=' + id + ']').hide();
                    $this.find('.j-caret').addClass('caret-right');
                    $this.find('.j-caret').removeClass('caret-bottom')
                } else {
                    //未展开则展开
                    //that.getSonPage(id, parent_id, $this, name);
                    that.targetElement = $this;
                    $('.j-children-son[data-parent_id=' + id + ']').show();
                    $this.find('.j-caret').removeClass('caret-right');
                    $this.find('.j-caret').addClass('caret-bottom')
                }
                $(this).toggleClass('j-children-active');
            });
        },
        mainShow: function (data) {
            var that = this;
            var tpl = $("#tpl").html();
            $("#tpl-main").html(_.template(tpl)({
                data: data.data
            }));
            that.isGetData();
            that.addEvent();
            that.iCheck();
        },
        // 新增
        submitData: function (data) {
            var that = this;
            Api.get({
                url: "/userRole/add.do",
                data: data,
                success: function () {
                    toastr.success('添加成功', '提示');
                    setTimeout(function (data) {
                        location.href = './system-role-management.html'
                    }, 1000)
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            })
        },
        // 修改
        changeData: function (data) {
            var that = this;
            Api.get({
                url: "/userRole/update.do",
                data: data,
                success: function () {
                    toastr.success('编辑成功', '提示');
                    setTimeout(function () {
                        location.href = './system-role-management.html'
                    }, 1000)
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }

            })
        }
    };
    $(function () {
        main.init()
    })
})();

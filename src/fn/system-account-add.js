;(function () {
    var main = {
        init: function () {
            this.id = HDL.getQuery('id');
            var that = this;
            if (this.id) {
                that.getRoleList(function () {
                    that.getData();
                });
            } else {
                that.getRoleList()
            }
            this.addEvent();
            this.Verification();
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
            if ($("input.flat")[0]) {
                $('input.flat').iCheck({
                    checkboxClass: 'icheckbox_flat-green',
                    radioClass: 'iradio_flat-green'
                });
            }
        },
        addEvent: function () {
            var that = this;

            $(document).on('ready', function () {
                that.iCheck();
            });

            // 取消
            $('#j-cancel').click(function () {
                var config = {};
                config.content = '未保存的数据将会丢失，确定要离开吗?';
                config.target = $(this);
                config.position = 'right';
                that.tip(config, function (btn, dialog) {
                    location.href = 'system-account.html';
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                })
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
                        return;
                    }
                }
                if ($('#roleList').val() == 'null') {
                    toastr.error('请选择角色', '提示');
                    isValid = false;
                    return;
                }

                if ($('#password').val() != $('#password_v').val()) {
                    toastr.error('两次输入的密码不一样', '提示');
                    $('#password').val('');
                    $('#password_v').val('');
                    isValid = false;
                    return false;
                }

                if (isValid == true) {
                    that.setPostData();
                }
            });
        },
        //获取数据
        getData: function () {
            var that = this;
            Api.get({
                url: "/employee/get.do",
                data: {
                    id: that.id
                },
                mask: true,
                success: function (data) {
                    that.renderDataFunc(data.data)
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            })
        },
        renderDataFunc: function (data) {
            var that = this;
            $.each(data, function (key, value) {
                switch (key) {
                    case 'user_name':
                        $('#user_name').val(value);
                        break;
                    //case 'password':
                    //    that.$.password.val(value);
                    //    that.$.password_v.val(value);
                    //    break;
                    case 'name':
                        $('#name').val(value);
                        break;
                    case 'role_id':
                        $('#roleList').find('option[value=' + value + ']').prop('selected', true);
                        break;
                    case 'status':
                        $('input[name=radio][value=' + value + ']').prop('checked', true);
                        $('input[name=radio][data-value=' + value + ']').iCheck('check');
                        break;
                }
            });
        },
        setPostData: function () {
            this.postData = {};
            this.postData.name = $.trim($('#name').val());
            this.postData.password = $.trim($('#password').val());
            this.postData.user_name = $.trim($('#user_name').val());
            this.postData.role_id = $('#roleList').val() || '0';
            this.postData.status = $('input[name=radio]:checked').attr('data-value');

            if (!this.id) {
                this.addAccount()
            } else {
                this.postData.id = this.id;
                this.changeAccount()
            }
        },
        //增加账号
        addAccount: function () {
            var that = this;
            Api.get({
                url: "/employee/add.do",
                data: that.postData,
                success: function () {
                    toastr.success('添加成功', '提示');
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');

                }
            })
        },
        //修改账号
        changeAccount: function () {
            var that = this;
            Api.get({
                url: '/employee/update.do',
                data: that.postData,
                success: function () {
                    toastr.success('修改成功', '提示');
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            })
        },
        getRoleList: function (cb) {
            Api.get({
                url: '/userRole/query.do',
                success: function (data) {
                    //数据渲染
                    var template = _.template($('#j-template').html());
                    $('#roleList').html(template({
                        items: data.data.data
                    }));

                    cb && cb()
                },
                error: function (data) {
                    toastr.error(data.msg, '提示')
                }
            });
        }
    };
    $(function () {
        main.init();
    })
}());

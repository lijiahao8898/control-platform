/**
 * Created by kyn on 17/3/21.
 */
;(function () {
    var main = {
        init: function () {
            this.id = HDL.getQuery('id');
            if( this.id ){
                this.getData();
            }
            this.isAjax = false;
            this.verification();
            this.addEvent();
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
        verification: function () {
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
                if (isValid == true) {
                    if( that.isAjax == true ){
                        return;
                    }
                    that.isAjax = true;
                    that.setPostData();
                    if( that.id ){
                        that.update();
                    }else{
                        that.submit();
                    }
                }
            });
        },
        addEvent: function () {
            var that = this;

            // 取消
            $('#j-cancel').click(function () {
                var config = {};
                config.content = '未保存的数据将会丢失，确定要离开吗?';
                config.target = $(this);
                config.position = 'right';
                that.tip(config, function (btn, dialog) {
                    location.href = 'goods-tax-template.html';
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                })
            });

            // HS编码 & 行邮税号
            $('#postal_number,#has_code').blur(function () {
                if ($(this).val() != '') {
                    $(this).attr('required', 'required');
                } else {
                    $(this).removeAttr('required', 'required');
                }
            });
        },
        getData: function () {
            var that = this;
            Api.get({
                url: '/tax_template/get.do',
                data: {
                    tax_id: that.id
                },
                mask: true,
                beforeSend: function () {

                },
                success: function (data) {
                    // 滚动条自动回顶部
                    //document.getElementsByTagName('body')[0].scrollTop = 0;
                    that.renderData(data);
                },
                complete: function () {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        /**
         * postData
         */
        setPostData: function () {
            this.postData = {};
            this.postData.tax_template_name = $.trim($('#tax_template_name').val());
            this.postData.rate = $.trim($('#rate').val());
            this.postData.hs_code = $.trim($('#hs_code').val());
            this.postData.postal_number = $.trim($('#postal_number').val());
            this.postData.threshold = 0;
            if( this.id ){
                this.postData.id = this.id;
            }

        },
        renderData: function (data) {
            $('#tax_template_name').val(data.data.tax_template_name);
            $('#rate').val(data.data.rate);
            $('#hs_code').val(data.data.hs_code);
            $('#postal_number').val(data.data.postal_number);
        },
        submit: function () {
            var that = this;
            Api.get({
                url: '/tax_template/add.do',
                data: {
                    tax_template: JSON.stringify(that.postData)
                },
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('添加成功!', '提示');
                    setTimeout(function () {
                        location.href = 'goods-tax-template.html';
                    }, 1000);
                },
                complete: function () {
                    setTimeout(function () {
                        that.isAjax = false;
                    }, 1000);
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        },
        update: function () {
            var that = this;
            Api.get({
                url: '/tax_template/update.do',
                data: {
                    tax_template: JSON.stringify(that.postData)
                },
                beforeSend: function () {

                },
                success: function (data) {
                    toastr.success('修改成功!', '提示');
                    setTimeout(function () {
                        location.href = 'goods-tax-template.html';
                    }, 1000);
                },
                complete: function () {
                    setTimeout(function () {
                        that.isAjax = false;
                    }, 1000);
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            });
        }
    }
    $(function () {
        main.init();
    })
})()
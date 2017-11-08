/**
 * Created by lijiahao on 17/4/26.
 */
;(function () {
    var main = {
        init: function () {
            this.postData = {};
            this.addEvent();
        },
        addEvent: function () {
            var that = this;

            var validator = new FormValidator();
            validator.settings.alerts = true;

            // 提交
            $('.j-save').click(function(){
                that.postData = {
                    old_passwd: $('.old_passwd').val() || '',
                    new_passwd: $('.new_passwd').val() || '',
                    new_passwd_repeat: $('.new_passwd_repeat').val() || '',
                    pwd: /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,20}$/,
                }
                if (that.verifyCode()) {
                    var is_super = $.cookie('is_super');
                    if( is_super == 1 ){
                        url = '/user/password/update.do';
                        postData = {
                            old_password:that.postData.old_passwd,
                            new_password:that.postData.new_passwd,
                            new_password_repeat:that.postData.new_passwd_repeat,
                        }
                    }else if( is_super == 0 ){
                        url = '/employee/update_password.do';
                        postData = {
                            old_password:that.postData.old_passwd,
                            new_password:postData.new_passwd,
                        }
                    }else{
                        toastr.error('未找到身份信息，修改密码失败！');
                        return false;
                    }
                    that.updatePwd(url,postData);
                }
                return false;
            })

            $(document).keydown(function (e) {
                var curKey = e.which;
                if (curKey == 13) {
                    $('#j-submit').click();
                }
            });
        },

        verifyCode: function () {
            var that = this;
            var pwd = that.postData.pwd;
            var old_passwd = that.postData.old_passwd;
            var new_passwd = that.postData.new_passwd;
            var new_passwd_repeat = that.postData.new_passwd_repeat;

            if ( !old_passwd || !new_passwd || !new_passwd_repeat){
                toastr.error('您未填写密码！');
                return false;
            }

            if( !pwd.test(old_passwd) || !pwd.test(new_passwd) || !pwd.test(new_passwd_repeat) ) {
                toastr.error('密码输入的格式不正确！');
                return false;
            }

            if( new_passwd != new_passwd_repeat ){
                toastr.error('两次密码设置不统一，请重新输入！');
                return false;
            }
            if( new_passwd == old_passwd ){
                toastr.error('与输入的旧密码相同，请重新输入！');
                return false;
            }
            return true;
        },

        updatePwd: function (url,postData) {
            var that = this;
            Api.get({
                url: url,
                data: postData,
                success: function (data) {
                    that.clearInput();
                    if( data.code == 10000 ){
                        toastr.success('修改密码成功！');
                    }
                },
                complete: function (data) {
                },
                error: function (data) {
                    toastr.error(data.msg, '提示')
                }
            })
        },
        clearInput: function () {
            $('.old_passwd').val('');
            $('.new_passwd').val('');
            $('.new_passwd_repeat').val('');
        }
    };
    // run
    $(function () {
        main.init();
    })
})();

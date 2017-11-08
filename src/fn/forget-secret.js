/**
 * Created by lijiahao on 17/4/26.
 */
;(function () {
    var main = {
        init: function () {
            this.refreshVerifyCode('verifyCode');
            this.addEvent();

            $('#backgroundJs').particleground({
                dotColor: '#e2dfdf',
                lineColor: '#e2dfdf'
            });
        },
        addEvent: function () {
            var that = this;
            var phoneTest = /^(((13[0-9]{1})|(17[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;

            var validator = new FormValidator();
            validator.settings.alerts = true;


            // 登录
            $('#j-submit').click(function(){
                var phone = $('#username').val();
                var passwd = $('#passwd').val();
                var passwdVerify = $('#passwd-verify').val();
                var code = $('#identifyingCode').val();
                var pwd = /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,20}$/;

                if ( code == '' ){
                    toastr.error('您未填写验证码！');
                    return false;
                }

                if ( that.phone != phone ){
                    toastr.error('您输入的号码和发送验证码的手机号不一样！');
                    return false;
                }
                if( !pwd.test(passwd) || !pwd.test(passwdVerify) ) {
                    toastr.error('密码输入的格式不正确！');
                    return false;
                }
                if( passwd != passwdVerify) {
                    toastr.error('两次的密码不一样，请重新输入');
                    $('#passwd').val('');
                    $('#passwd-verify').val('');
                    return false;
                }
                that.submitData()

            })

            $(document).keydown(function (e) {
                var curKey = e.which;
                if (curKey == 13) {
                    $('#j-submit').click();
                }
            });

            // 短信验证码
            $('.j-identifyingCode').click(function(e){
                var $this = $(this);
                e.preventDefault();
                var phone = $('#username').val();


                if( !phoneTest.test(phone) ){
                    toastr.error('您输入的号码不正确！');
                    return false;
                }
                if($.trim($('#checkcode').val()) == '' ){
                    toastr.error('请输入相应的图形验证码,获取短信验证码。');
                    return false;
                }
                if( $this.hasClass('j-identifyingCode') ){
                    that.getIdentifyingCode(phone,$this);
                }
            });
        },

        submitData : function(){
            var that = this;
            var phone = $('#username').val();
            var passwd = $('#passwd').val();
            var passwdVerify = $('#passwd-verify').val();
            var code = $('#identifyingCode').val();
            var data = {
                mobile:phone,
                password:passwd,
                password2nd:passwdVerify,
                verify_code:code
            };

            that.resetPwdArgs(data);
        },
        resetPwdArgs: function (data) {
            var that = this;
            Api.get({
                url: '/user/reset_password.do',
                data: data,
                mask: true,
                beforeSend: function () {

                },
                success: function (data) {
                    if( data.code == 10000 ){
                        toastr.success('重置密码成功！','提示');
                        setTimeout(function(){
                            location.href='seller_login.html';
                        },1000)
                    }else{
                        toastr.warn(data.msg,'提示');
                    }
                },
                complete: function () {

                },
                error: function (data, msg) {
                    toastr.error(data.msg)
                }
            });
        },
        /**
         * 刷新验证码
         * @param id
         */
        refreshVerifyCode: function (id) {
            $('#' + id).click(function (e) {
                e.preventDefault();
                var img = $(this);
                var src = img.attr('src');
                img.attr('src', src.split('?')[0] + '?' + Math.random());
            });
        },

        getIdentifyingCode: function(phone,$this){
            var that = this;
            var t = 60;
            var l;

            $this.removeClass('j-identifyingCode');

            function timer(){
                if( t > 0 ){
                    t --;
                    $this.text(t + '秒,请稍等');
                    $this.attr('disabled','disabled');
                    l = setTimeout(timer,1000);
                }else{
                    clearTimeout(l);
                    $this.text('获取验证码');
                    $this.addClass('j-identifyingCode');
                    $this.removeAttr('disabled','disabled')
                }
            };

            that.getCodeArgs(phone,$this,timer);
        },

        // 获取验证码
        getCodeArgs: function (phone,$this,timer){
            var that = this;
            Api.get({
                url: '/user/verify_code/send.do',
                data: {
                    mobile :phone,
                    validate_code:$.trim($('#checkcode').val())
                },
                mask: true,
                beforeSend: function () {

                },
                success: function (data) {
                    if( data.code = 10000 ){
                        toastr.success('验证码已经发送，请等待！');
                        timer();
                        that.phone = phone;
                        that.refreshVerifyCode('verifyCode');
                    }else{
                        toastr.warn(data.msg,'提示');
                        $('#btn-verify-tel').addClass('j-identifyingCode');
                    }
                },
                complete: function () {

                },
                error: function (data, msg) {
                    toastr.error(data.msg);
                    $('#btn-verify-tel').addClass('j-identifyingCode');
                }
            });
        },

        login: function () {
            Api.get({
                url: '/user/login.do',
                data: {
                    user_name: $.trim($('#username').val()),
                    password: $.trim($('#password').val()),
                    verify_code: $.trim($('#verify').val())
                },
                success: function (data) {
                    // 存cookie
                    $.cookie('username', $.trim($('#username').val()), {path: '/'});
                    $.cookie('seller_id', data.data.seller_id, {path: '/'});
                    $.cookie('user_id', data.data.user_id, {path: '/'});
                    $.cookie('biz_code', data.data.biz_code, {path: '/'});

                    if (!window.localStorage) {
                        toastr.error('游览器不支持localStorage')
                    } else {
                        localStorage.setItem('root_role', data.data.root_role)
                    }

                    console.log(data);
                    location.href = 'index.html';
                },
                complete: function (data) {

                },
                error: function (data) {
                    toastr.error(data.msg, '提示')
                }
            })
        }
    };
    // run
    $(function () {
        main.init();
    })
})();

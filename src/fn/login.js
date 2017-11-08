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
            var validator = new FormValidator();
            validator.settings.alerts = true;

            // 登录
            $('#j-submit').click(function () {
                for (var i = 0; i < $('[required]').length; i++) {
                    var required = $('[required]');
                    var result = validator.checkField.call(validator, required.eq(i));
                    if (result.valid === false) {
                        return;
                    }
                }
                that.login();


            });

            $(document).keydown(function (e) {
                var curKey = e.which;
                if (curKey == 13) {
                    $('#j-submit').click();
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
                    $.cookie('is_super', data.data.is_super, {path: '/'});

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

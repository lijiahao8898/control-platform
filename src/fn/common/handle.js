/**
 * Created by lijiahao on 17/3/14.
 */
var HDL = (function () {
    var handle = {
        init: function () {
            return this;
        },
        countChecked: function () {
            var checkCount = $(".checkbox:checked").length;

            if (checkCount) {
                $('.column-title').hide();
                $('.bulk-actions').show();
                $('.action-cnt').html(checkCount + '条');
            } else {
                $('.column-title').show();
                $('.bulk-actions').hide();
            }
        },
        getQuery: function (key) {
            var t = {};
            location.search.replace("?", "").replace(/&?([^=&]+)=([^=&]*)/g, function ($0, $1, $2) {
                t[$1] = $2;
            });
            return typeof t[key] === "undefined" ? "" : t[key];
        },
        /**
         * 价格
         * 小数位为0直接显示整数，有一位显示一位，有多位显示两位
         * @param data
         * @returns {*}
         */
        price: function (data) {
            if (data) {
                var yuan = Number(data / 100);
                var fixed0 = yuan.toFixed(0);
                var fixed1 = yuan.toFixed(1);
                var fixed2 = yuan.toFixed(2);

                if (Number(fixed0) == Number(fixed1) && Number(fixed1) == Number(fixed2)) {
                    return fixed0;
                } else if (Number(fixed0) != Number(fixed1) && Number(fixed1) == Number(fixed2)) {
                    return fixed1;
                } else {
                    return fixed2;
                }
            } else {
                return 0;
            }
        },

        /**
         * 价格
         * 保留两位小数
         * @param data
         * @returns {string}
         */
        pricetwo: function (data) {
            return Number(data / 100).toFixed(2);
        },

        /**
         *  type  0：YYYY-MM-DD格式  1：YYYY-MM-DD hh:mm:ss格式
         *  a     选择的时间
         *  b     当前时间
         *  msg   不合法时间的提示信息
         */
        timeCompare: function (a, b, type, msg) {
            var arr = a.split("-");
            var starttime = new Date(arr[0], arr[1], arr[2]);
            var starttimes = starttime.getTime();

            var arrs = b.split("-");
            var lktime = new Date(arrs[0], arrs[1], arrs[2]);
            var lktimes = lktime.getTime();

            if (starttimes < lktimes) {
                return false;
            }
            return true;
        }
    };
    return handle.init();
})();
/**
 * Created by lijiahao on 17/4/26.
 */
;(function () {
    var main = {
        init: function () {
            this.getBrandData();  //获取统计数据
            this.getChartData();
            this.render_data = {};  //存放用于渲染折线图的数据
        },
        getBrandData: function () {
            var that = this;
            Api.get({
                url: '/share_partner/shop/sum/get.do',
                data: {},
                mask: true,
                beforeSend: function (XMLHttpRequest) {
                },
                success: function (data) {
                    var t = _.template($('#j-template-brand').html());
                    $('#brandList').html(t({
                       item: data.data
                    }));
                },
                complete: function () {
                },
                error: function (data) {

                }
            })
        },
        getChartData: function () {
            var that = this;
            var data = [
                {
                    type: '2003',
                    rangeType: 1,
                    deviceType: 0
                },
                {
                    type: '7001',
                    rangeType: 1,
                    deviceType: 0
                },
                {
                    type: '1002',
                    rangeType: 1,
                    deviceType: 0
                },
                {
                    type: '1001',
                    rangeType: 1,
                    deviceType: 0
                },
                {
                    type: '1004',
                    rangeType: 1,
                    deviceType: 0
                },
                {
                    type: '002',
                    rangeType: 1,
                    deviceType: 0
                }
            ];
            for (var i = 0,postData; postData=data[i++];) {
                var chart_data = that.ajaxDataType(postData);
            }
        },
        ajaxDataType: function (postData) {
            var that = this;
            Api.get({
                url: '/data/range/get.do',
                data: postData,
                mask: true,
                beforeSend: function (XMLHttpRequest) {
                },
                success: function (data) {
                    that.handleData(data.data);

                },
                complete: function () {
                },
                error: function (data) {

                }
            })
        },
        handleData: function (data) {
            var that = this;
            var resData = ['2001','7001','2003','1002','1001','1004'];
            for (var i = 0; i < 6; i++) {
                var key = resData[i];
                if (!that.render_data[key] && data[key]) {
                    data[key].range.forEach(function (value,index) {
                        value['year'] = value['date'];
                    });
                    that.render_data[key] = data[key].range;
                    Morris.Line({
                        element: 'graph_line'+parseInt(key),
                        xkey: 'year',
                        ykeys: ['value'],
                        labels: ['Value'],
                        hideHover: 'auto',
                        lineColors: [
                            '#26B99A', '#34495E', '#ACADAC', '#3498DB'
                        ],
                        data: that.render_data[key],
                        resize: false
                    });
                }
            }
        },
    };
    // run
    $(function () {
        main.init();
    })
})();

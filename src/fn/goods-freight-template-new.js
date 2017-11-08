/**
 * Created by kyn on 17/3/8.
 */
;(function () {
    var main = {
        init: function () {
            this.areas = '';                // 地区的数组
            this.batch_type = 0;            // 批量操作的开关
            this.isAjax = false;

            // 填充高度
            var height = window.innerHeight - 100;
            var contentHeight = $('.x_panel').height();
            $('.x_panel').css({
                'min-height': (height > contentHeight ? height : contentHeight) + 'px'
            });

            this.template_id = HDL.getQuery('id');

            if (this.template_id) {
                this.getData();
            }

            this.addEvent();
            this.verification();
        },
        /**
         * icheck定义
         */
        iCheck: function () {
            var that = this;

            if ($("input.flat")[0]) {
                $('input.flat').iCheck({
                    checkboxClass: 'icheckbox_flat-green',
                    radioClass: 'iradio_flat-green'
                });
            }

            // 计价方式
            $('input[name=radio]').on('ifChecked', function () {
                var radioVal = $(this).attr('data-value');
                if (radioVal == 0) {
                    $('.unit').text('件');
                    $('.unit-che').text('件');
                    $('.basic_count,.extra_count').attr('pattern', 'numeric')
                } else if (radioVal == 2) {
                    $('.unit').text('m³');
                    $('.unit-che').text('体积');
                    $('.basic_count,.extra_count').attr('pattern', 'decimalOne')
                } else {
                    $('.unit').text('kg');
                    $('.unit-che').text('重');
                    $('.basic_count,.extra_count').attr('pattern', 'decimalOne')
                }
            });
        },
        /**
         * popup
         * @param data
         * @param cb
         * @param success
         */
        popup: function (data, cb, success) {
            var that = this;
            this.popupDialog = jDialog.dialog({
                title: data.title,
                content: data.content,
                width: data.width || 600,
                height: data.height || 600,
                draggable: false,
                buttonAlign: 'right',
                buttons: [{
                    type: 'highlight',
                    text: '确定',
                    handler: function (button, dialog) {
                        success && success(button, dialog);
                        dialog.close();
                    }
                }, {
                    type: 'highlight',
                    text: '取消',
                    handler: function (button, dialog) {
                        dialog.close();
                    }
                }]
            });
            cb && cb();
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
        /**
         * 表格
         */
        isCheckAll: function () {
            // todo 检查是否选中
            var checkedItem = $('.check-item:checked').length;
            if (checkedItem == $('.check-item').length) {
                $(".check-all").prop('checked', true);
            } else {
                $(".check-all").prop('checked', false);
            }
        },
        /**
         *
         */
        isCheckAreaAll: function (checkbox, num_1, num_2) {
            if (num_1.length == num_2.length) {
                checkbox.prop('checked', true);
            } else {
                checkbox.prop('checked', false);
            }
        },
        // 验证表格是否输入
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
                for (var n = 0; n < $('.template-tr').length; n++) {
                    if (!$('.template-tr').eq(n).attr('data-arr')) {
                        toastr.error('暂未选择地区', '提示');
                        return;
                    }
                }
                if (isValid == true) {
                    if (that.template_id) {
                        that.update();
                    } else {
                        that.submit();
                    }
                }
            });
        },
        addEvent: function () {
            var that = this;

            $(document).on('ready', function () {
                that.iCheck();
            });

            // 添加地区渲染
            $('#j-add-area').click(function () {
                var status = $('input[name=radio]:checked').attr('data-value');
                that.renderBorder('', status);
                that.isCheckAll();
            });

            // 添加地区 - 表格删除
            $("body").on("click", ".j-del", function () {
                var config = {};
                config.content = '确定要删除吗?';
                config.target = $(this);
                that.tip(config, function (btn, dialog) {
                    config.target.parents(".template-tr").remove();
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                });
            });

            // 添加地区 - 批量操作
            $('#batch-ope').click(function (e) {
                e.preventDefault();

                if ($(".template-tr").length == 0) {
                    toastr.error('无运费信息,无法批量', '提示');
                } else {
                    var $checkbox = $('.template-tr .check-item');

                    if ($(this).html() == '取消批量') {
                        $('.the-batch').hide();
                        that.batch_type = 0;
                        $(this).html('批量操作')
                    } else {
                        $('.the-batch').show();
                        that.batch_type = 1;
                        $(this).html('取消批量');
                    }
                    // 地区选择的ｃｈｅｃｋｂｏｘ
                    if (!$checkbox.hasClass('check-show')) {
                        $checkbox.addClass('check-show');
                    } else {
                        $checkbox.removeClass('check-show');
                        if ($checkbox.attr('checked', 'checked')) {
                            $checkbox.removeAttr('checked', 'checked')
                        }
                    }
                    that.isCheckAll();
                }
            });

            // 全选
            $('body').on('click', ".check-all", function () {
                if (this.checked) {
                    $(".check-item").each(function () {
                        this.checked = true;
                    });
                } else {
                    $(".check-item").each(function () {
                        this.checked = false;
                    });
                }
            });

            // 单选
            $('body').on('click', ".check-item", function () {
                that.isCheckAll();
            });

            // 批量设置
            $("body").on('click', '#batch-setting', function (e) {
                e.preventDefault();
                var $checked = $('.check-item:checked').length;
                if ($checked < 1) {
                    toastr.error('请至少选择一条信息', '提示');
                } else {
                    var data = {};
                    data.title = '批量设置';
                    data.content = $('#batchSetup').html();
                    data.width = 800;
                    data.height = 100;
                    that.popup(data, function () {
                        var radioVal = $('input[name=radio]:checked').attr('data-value');
                        if (radioVal == 0) {
                            $('.unit').text('件');
                            $('.unit-che').text('件');
                            $('.basic_count,.extra_count').attr('pattern', 'numeric')
                        } else if (radioVal == 2) {
                            $('.unit').text('m³');
                            $('.unit-che').text('体积');
                            $('.basic_count,.extra_count').attr('pattern', 'decimalOne')
                        } else {
                            $('.unit').text('kg');
                            $('.unit-che').text('重');
                            $('.basic_count,.extra_count').attr('pattern', 'decimalOne')
                        }

                    }, function () {
                        var $parent = $('.check-item:checked').parents(".template-tr");
                        $parent.find(".basic_count").val($(".batch-input").find(".basic_counts").val());
                        $parent.find(".basic_charge").val($(".batch-input").find(".basic_charges").val());
                        $parent.find(".extra_count").val($(".batch-input").find(".extra_counts").val());
                        $parent.find(".extra_charge").val($(".batch-input").find(".extra_charges").val());
                    })
                }
            });

            // 批量删除运费信息
            $('#batch-del').click(function () {
                var $checked = $('.check-item:checked').length;
                var length = $('.template-tr').length;
                if ($checked < 1) {
                    toastr.error('请至少选择一条信息', '提示');
                } else {
                    if (length >= 1) {
                        // 不管怎么样都删掉
                        $('.check-item:checked').parents('tr').remove();

                        $(".the-batch").hide();

                        if ($('#batch-ope').html() == '取消批量') {
                            that.batch_type = 0;
                            $('#batch-ope').html('批量操作')
                        } else {
                            that.batch_type = 1;
                            $('#batch-ope').html('取消批量');
                        }

                        $('.template-tr .check-item').removeClass('check-show');
                    } else {
                        return;
                    }
                    that.isCheckAll();
                }
            });

            // 添加地区
            $("body").on("click", ".j-city-choose", function () {
                var target = $(this);
                var config = {};
                var data = target.parents('.template-tr').attr('data-arr');
                if (data) {
                    var dataArr = JSON.parse(decodeURIComponent(data));
                    console.log('data:' + dataArr);
                }
                config.title = '配送区域';
                config.content = '<div id="areaTpl"></div>';
                config.width = 800;
                config.height = 450;
                that.popup(config, function () {
                    $('.j-dialog').css({'overflow': 'visible'});
                    that.renderArea(function () {
                        // 勾选已经选中的
                        if (dataArr) {
                            var checkbox = $('.check-city,.check-city-all');
                            for (var x = 0; x < checkbox.length; x++) {
                                for (var n = 0; n < dataArr.length; n++) {
                                    if (dataArr[n].code == $(checkbox[x]).attr('data-id')) {
                                        $(checkbox[x]).prop('checked', true);

                                        // 是省份
                                        if (dataArr[n].level == 1) {
                                            $(checkbox[x]).parents('.area-item').find('.check-city').prop('checked', true);
                                        }
                                        // 展示选中的个数
                                        var number = $(checkbox[x]).parents('.area-item').find('.check-city:checked').length;
                                        $(checkbox[x]).parents('.area-item').find('.city-length').text('(' + number + ')');
                                    }
                                }
                            }
                        }
                        var area = $('.area');
                        for (var i = 0; i < area.length; i++) {
                            var domArea = $('.area').eq(i).find('.check-areas-all');
                            var numArea = $('.area').eq(i).find('.check-city-all:checked');
                            var numAreaChecked = $('.area').eq(i).find('.check-city-all');
                            that.isCheckAreaAll(domArea, numArea, numAreaChecked);
                        }
                        var city = $('.area-item');
                        for (var m = 0; m < city.length; m++) {
                            var domCity = city.eq(m).find('.check-city-all');
                            var numCity = city.eq(m).find('.check-city');
                            var numCityChecked = city.eq(m).find('.check-city:checked');
                            that.isCheckAreaAll(domCity, numCity, numCityChecked);
                        }
                    });
                    that.chooseCity();


                }, function () {
                    var arr = [];
                    // 组装数据
                    var areaItem = $('.check-city-all');

                    for (var i = 0; i < areaItem.length; i++) {

                        if (areaItem.eq(i).prop('checked') == true) {
                            // 如果选中
                            arr.push({
                                level: 1,
                                code: areaItem.eq(i).attr('data-id'),
                                name: areaItem.eq(i).attr('data-name')
                            })
                        } else {
                            // 如果没有选中 遍历它的子集
                            var cityItem = areaItem.eq(i).parents('.area-item').find('.check-city:checked');
                            var cityLength = areaItem.eq(i).attr('data-city_length');
                            var checkedCityLength = cityItem.length;
                            // 全部选中了当前省下面的所有市
                            // 全部选中 只用省
                            if (cityLength == checkedCityLength) {

                            } else {
                                // 没有选中 用市
                                for (var m = 0; m < cityItem.length; m++) {
                                    arr.push({
                                        level: 2,
                                        code: cityItem.eq(m).attr('data-id'),
                                        name: cityItem.eq(m).attr('data-name')
                                    })
                                }
                            }
                        }
                    }
                    console.log(arr);
                    target.parents('.template-tr').attr('data-arr', encodeURIComponent(JSON.stringify(arr)));
                    var template = _.template($('#template-contain').html());
                    var contain = target.parents('.template-tr').find('.areas-contain');
                    contain.html(template({
                        items: arr
                    }))


                })

            });

            // 取消
            $('#j-cancel').click(function () {
                var config = {};
                config.content = '未保存的数据将会丢失，确定要离开吗?';
                config.target = $(this);
                config.position = 'right';
                that.tip(config, function (btn, dialog) {
                    location.href = 'goods-freight-template.html';
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                })
            })
        },
        /**
         * 地区选择
         */
        chooseCity: function () {

            // 地区选择
            $(document).on('change', '.check-areas-all', function () {
                var area = $(this).parents('.area');

                // 地区选择的时候 市选择隐藏
                $('.city-item').hide();
                if (this.checked) {
                    area.find('.check-city-all,.check-city').prop('checked', true);
                    for (var i = 0; i < area.find('.check-city-all').length; i++) {
                        area.find('.city-length').eq(i).text('(' + area.find('.check-city-all').eq(i).attr('data-city_length') + ')');
                    }
                } else {
                    area.find('.check-city-all,.check-city').prop('checked', false);
                    for (var n = 0; n < area.find('.check-city-all').length; n++) {
                        area.find('.city-length').eq(n).text('');
                    }
                }
            });

            // 省选择
            $(document).on('change', '.check-city-all', function () {
                var area = $(this).parents('.area');
                var checkCityAll = area.find('.check-city-all');
                var checkedCityAll = area.find('.check-city-all:checked');
                var areaItem = $(this).parents('.area-item');
                var cityLength = $(this).attr('data-city_length');
                var $cityLength = $(this).parent().find('.city-length');
                if (this.checked) {
                    areaItem.find('.check-city').prop('checked', true);
                    $cityLength.text('(' + cityLength + ')');
                } else {
                    areaItem.find('.check-city').prop('checked', false);
                    $cityLength.text('');
                }
                // 地区选择
                if (checkCityAll.length == checkedCityAll.length) {
                    area.find('.check-areas-all').prop('checked', true);
                } else {
                    area.find('.check-areas-all').prop('checked', false);
                }
            });

            // 市选择
            $(document).on('change', '.check-city', function () {
                var area = $(this).parents('.area');
                var areaItem = $(this).parents('.area-item');
                var checkCity = areaItem.find('.check-city');
                var checkedCity = areaItem.find('.check-city:checked');
                var $cityLength = areaItem.find('.city-length');
                if (checkCity.length == checkedCity.length) {
                    areaItem.find('.check-city-all').prop('checked', true);
                } else {
                    areaItem.find('.check-city-all').prop('checked', false);
                }
                $cityLength.text('(' + checkedCity.length + ')');

                // 地区选择
                var checkCityAll = area.find('.check-city-all');
                var checkedCityAll = area.find('.check-city-all:checked');
                if ((checkCityAll.length == checkedCityAll.length) && this.checked) {
                    area.find('.check-areas-all').prop('checked', true);
                } else {
                    area.find('.check-areas-all').prop('checked', false);
                }
            });

            $(document).on('click', '.j-city-close', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).parents('.city-item').hide();
            });

            // 点击省 展示市的选择框
            $(document).on('click', '.area-item', function () {
                $('.city-item').hide();
                $(this).find('.city-item').show();
            });
        },
        renderBorder: function (data, status) {
            var that = this;
            var template = _.template($('#tpl').html());
            $('#template-list').append(template({
                items: data || '',
                batchType: that.batch_type,
                status: status || '1'
            }));
        },
        /**
         * 地区
         */
        renderArea: function (cb) {
            var that = this;
            Api.get({
                url: "/freight/queryAreas.do",
                success: function (data) {
                    that.areas = data;
                    that.renderCity(data);
                    cb && cb();
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            })
        },
        renderCity: function (data) {
            var $tpl1 = $("#tpl1").html();
            $("#areaTpl").html(_.template($tpl1)({
                data: data.data.areas
            }));
            this.iCheck();
        },
        // 读取模板数据
        getData: function () {
            var that = this;
            that.iCheck();
            Api.get({
                url: "/freight/get.do",
                data: {
                    id: that.template_id
                },
                mask: true,
                success: function (data) {
                    var $pricing_method = data.data.freight_template_dto.pricing_method;
                    var $tpl = data.data.freight_template_dto;
                    $('#name').val($tpl.name);

                    // 渲染默认运费
                    $('.default-shipping .basic_charge').val(($tpl.basic_charge) / 100);
                    $('.default-shipping .extra_charge').val(($tpl.extra_charge) / 100);
                    if ($pricing_method == 0) {
                        $('.default-shipping .basic_count').val($tpl.basic_count);
                        $('.default-shipping .extra_count').val($tpl.extra_count)
                    } else {
                        $('.default-shipping .basic_count').val(($tpl.basic_count) / 10);
                        $('.default-shipping .extra_count').val(($tpl.extra_count) / 10)
                    }

                    // 渲染radio
                    if ($pricing_method == 0) {
                        $('input[name=radio][data-value=0]').attr('checked', 'checked');
                        $('.unit').text('件');
                        $('.unit-che').text('件');
                        $('.basic_count,.extra_count').attr('pattern', 'numeric')
                    } else if ($pricing_method == 1) {
                        $('input[name=radio][data-value=1]').attr('checked', 'checked');
                        $('.unit').text('kg');
                        $('.unit-che').text('重');
                        $('.basic_count,.extra_count').attr('pattern', 'decimalOne')
                    } else {
                        $('input[name=radio][data-value=2] ').attr('checked', 'checked');
                        $('.unit').text('m³');
                        $('.unit-che').text('体积');
                        $('.basic_count,.extra_count').attr('pattern', 'decimalOne')
                    }

                    // 提交的数据和获取到的不太一样.需要处理下
                    if ($tpl.freight_area_template_list) {
                        for (var i = 0; i < $tpl.freight_area_template_list.length; i++) {
                            for (var n = 0; n < $tpl.freight_area_template_list[i].areas.length; n++) {
                                var areas = {
                                    code: $tpl.freight_area_template_list[i].areas[n].code,
                                    name: $tpl.freight_area_template_list[i].areas[n].name,
                                    level: $tpl.freight_area_template_list[i].areas[n].level
                                };
                                $tpl.freight_area_template_list[i].areas[n] = areas;
                            }
                        }
                    }

                    that.renderBorder($tpl.freight_area_template_list, $pricing_method);
                },
                complete: function () {

                },
                error: function () {
                    toastr.error('失败', '错误提示');
                }
            })
        },
        /**
         * 组装数据
         */
        setPostData: function () {
            this.postData = {};
            if (this.template_id) {
                this.postData.id = this.template_id;
            }
            this.postData.name = $.trim($('#name').val());
            this.postData.pricing_method = $('input[name=radio]:checked').attr('data-value');
            this.postData.basic_charge = (Number($.trim($('.default-shipping .basic_charge').val())) * 100).toFixed(0);
            this.postData.basic_count = (this.postData.pricing_method == 0 ? $.trim($('.default-shipping .basic_count').val()) : (Number($.trim($('.default-shipping .basic_count').val())) * 10).toFixed(0));
            this.postData.extra_charge = (Number($.trim($('.default-shipping .extra_charge').val())) * 100).toFixed(0);
            this.postData.extra_count = (this.postData.pricing_method == 0 ? $.trim($('.default-shipping .extra_count').val()) : (Number($.trim($('.default-shipping .extra_count').val())) * 10).toFixed(0));
            this.postData.freight_area_template_list = [];

            var tr = $('.template-tr');
            for (var i = 0; i < tr.length; i++) {
                var list = {
                    basic_charge: (Number($.trim(tr.eq(i).find('.basic_charge').val())) * 100).toFixed(0),
                    basic_count: this.postData.pricing_method == 0 ? $.trim(tr.eq(i).find('.basic_count').val()) : (Number($.trim(tr.eq(i).find('.basic_count').val()) * 10).toFixed(0)),
                    extra_charge: (Number($.trim(tr.eq(i).find('.extra_charge').val())) * 100).toFixed(0),
                    extra_count: this.postData.pricing_method == 0 ? $.trim(tr.eq(i).find('.extra_count').val()) : (Number($.trim(tr.eq(i).find('.extra_count').val()) * 10).toFixed(0)),
                    areas: JSON.parse(decodeURIComponent(tr.eq(i).attr('data-arr')))
                };
                this.postData.freight_area_template_list.push(list);
            }
            this.postData = JSON.stringify(this.postData);
        },
        // 添加运费模板
        submit: function () {
            var that = this;
            if (that.isAjax === true) {
                return;
            }
            that.isAjax = true;
            that.setPostData();
            Api.post({
                url: "/freight/add.do",
                data: {
                    freight_template_dto: that.postData
                },
                success: function (data) {
                    toastr.success('添加成功!', '提示');
                    setTimeout(function () {
                        location.href = 'goods-freight-template.html'
                    }, 1000)
                },
                complete: function () {
                    setTimeout(function () {
                        that.isAjax = false;
                    }, 1000)
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            })
        },
        update: function () {
            var that = this;
            if (that.isAjax === true) {
                return;
            }
            that.isAjax = true;
            that.setPostData();
            Api.post({
                url: "/freight/update.do",
                data: {
                    freight_template_dto: that.postData
                },
                success: function (data) {
                    toastr.success('编辑成功!', '提示');
                    setTimeout(function () {
                        location.href = 'goods-freight-template.html'
                    }, 1000)
                },
                complete: function () {
                    setTimeout(function () {
                        that.isAjax = false;
                    }, 1000)
                },
                error: function (data) {
                    toastr.error(data.msg, '提示');
                }
            })
        }
    };
    $(function () {
        main.init();
    })
}());

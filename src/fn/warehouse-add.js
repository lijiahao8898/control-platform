;(function () {
    var main = {
        init: function () {
            this.id = HDL.getQuery('id');
            var that = this;
            this.parent_name_map = {
                "country": "国家",
                "province": "省",
                "city": "市",
                "area": "区"
            };
            this.isAjax = false;
            if (this.id) {
                that.getData();
            }
            this.addEvent();
            this.verification();
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
        addEvent: function () {
            var that = this;

            // 取消
            $('#j-cancel').click(function () {
                var config = {};
                config.content = '未保存的数据将会丢失，确定要离开吗?';
                config.target = $(this);
                config.position = 'right';
                that.tip(config, function (btn, dialog) {
                    location.href = 'warehouse.html';
                    dialog.close();
                }, function (btn, dialog) {
                    dialog.close();
                })
            });

            // 省 市 区 选择
            $(document).on('change', 'select', function () {
                var name = $(this).attr('data-nextName');
                var code = $(this).find('option:selected').attr('data-code');
                var parent_cfg = {};
                parent_cfg.parent_name = name;
                parent_cfg.parent_code = code;
                switch (name) {
                    // 国家
                    case 'country':
                        break;
                    // 省
                    case 'province':
                        if (code == 'cn') {
                            that.getArea($('#areaList-province'), parent_cfg, function () {
                            });
                            $('#areaList-province,#areaList-city,#areaList-area').attr('required', 'required');
                        } else {
                            $('#areaList-province,#areaList-city,#areaList-area').removeAttr('required');
                            that.areaInit(['#areaList-province', '#areaList-city', '#areaList-area']);
                        }
                        break;
                    // 市
                    case 'city':
                        that.getArea($('#areaList-' + name), parent_cfg, function () {
                            that.areaInit(['#areaList-area']);
                        });
                        break;
                    // 区
                    case 'area':
                        that.getArea($('#areaList-' + name), parent_cfg, function () {

                        });
                        break;
                }
            })

        },
        //验证
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
                    that.setPostData();

                    if (!that.id) {
                        that.addAccount()
                    } else {
                        that.postData.id = that.id;
                        that.changeAccount()
                    }
                }
            });
        },
        /**
         * 获取地区信息
         */
        getArea: function (area, parent_cfg, cb) {
            var that = this;
            Api.get({
                url: "/store/region/list.do",
                data: {
                    parent_code: parent_cfg.parent_code || 'CN'
                },
                success: function (data) {
                    var template = _.template($('#j-template').html());
                    $(area).html(template({
                        items: data.data.region_list,
                        parent_name: that.parent_name_map[parent_cfg.parent_name] || '省'
                    }));

                    cb && cb(data);
                },
                error: function () {

                }
            })
        },
        areaInit: function (arr) {
            for (var i = 0; i < arr.length; i++) {
                var type = arr[i].split('-')[1];
                $(arr[i]).html('<option value="null">' + this.parent_name_map[type] + '</option>')
            }
        },
        //获取数据
        getData: function () {
            var that = this;
            Api.get({
                url: "/storage/get.do",
                data: {
                    id: that.id
                },
                success: function (data) {
                    // todo 先渲染省市区
                    if (data) {
                        if (data.data.address_province) {
                            that.getArea($('#areaList-province'), {
                                parent_name: 'province',
                                parent_code: data.data.address_country.split('|')[1]
                            }, function () {
                                that.getArea($('#areaList-city'), {
                                    parent_name: 'city',
                                    parent_code: data.data.address_province.split('|')[1]
                                }, function () {
                                    that.getArea($('#areaList-area'), {
                                        parent_name: 'area',
                                        parent_code: data.data.address_city.split('|')[1]
                                    }, function () {
                                        that.renderDataFunc(data.data)
                                    });
                                });
                            });
                        } else {
                            that.renderDataFunc(data.data)
                        }
                    }
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
                    //case 'storage_id':
                    //    $('#storageId').val(value);
                    //    break;
                    case 'storage_short_name':
                        $('#storageShortName').val(value);
                        break;
                    case 'storage_name':
                        $('#storageName').val(value);
                        break;
                    case 'supplier_name':
                        $('#supplierName').val(value);
                        break;
                    case 'link_man':
                        $('#linkMan').val(value);
                        break;
                    case 'mobile':
                        $('#mobile').val(value);
                        break;
                    case 'address_country':
                        if (value != '国外') {
                            $('#areaList-country option[data-code=' + value.split('|')[1] + ']').prop('selected', true);
                        } else {
                            $('#areaList-country option[data-code=en]').prop('selected', true);
                        }
                        break;
                    case 'address_province':
                        $('#areaList-province option[data-code=' + value.split('|')[1] + ']').prop('selected', true);
                        break;
                    case 'address_city':
                        $('#areaList-city option[data-code=' + value.split('|')[1] + ']').prop('selected', true);
                        break;
                    case 'address_district':
                        $('#areaList-area option[data-code=' + value.split('|')[1] + ']').prop('selected', true);
                        break;
                    case 'address_street':
                        $('#street').val(value);
                        break;
                    case 'storage_type':
                        $('#storageType option[data-value=' + value + ']').prop('selected', true);
                        break;
                }
            });
        },
        /**
         * 设置要提交的数据
         * this.postData
         */
        setPostData: function () {
            this.postData = {};
            //this.postData.storage_id = $.trim($('#storageId').val());                                       // 仓库ID
            this.postData.storage_short_name = $.trim($('#storageShortName').val());                        // 仓库简称
            this.postData.storage_name = $.trim($('#storageName').val());                                   // 仓库名称
            this.postData.supplier_name = $.trim($('#supplierName').val());                                 // 供应商名称
            this.postData.link_man = $.trim($('#linkMan').val());                                            // 联系人
            this.postData.mobile = $.trim($('#mobile').val());                                              // 联系电话
            if ($('#areaList-country option:selected').attr('data-value') == '中国') {
                this.postData.address_country = $('#areaList-country option:selected').attr('data-value') + '|' + $('#areaList-country option:selected').attr('data-code');     // 国家
                this.postData.address_province = $('#areaList-province option:selected').attr('data-value') + '|' + $('#areaList-province option:selected').attr('data-code');    // 省
                this.postData.address_city = $('#areaList-city option:selected').attr('data-value') + '|' + $('#areaList-city option:selected').attr('data-code');            // 市
                this.postData.address_district = $('#areaList-area option:selected').attr('data-value') + '|' + $('#areaList-area option:selected').attr('data-code');        // 区
            } else {
                this.postData.address_country = '国外'
            }
            this.postData.address_street = $.trim($('#street').val());                                      // 街道 - 详细地址
            this.postData.storage_type = $('#storageType option:selected').attr('data-value');              // 仓库类型
            this.postData.cost = 0;                                                                         // 仓库费用 默认0
            this.postData.status = 1;                                                                       // 仓里状态 默认激活1
        },
        //增加账号
        addAccount: function () {
            var that = this;
            if (this.isAjax == true) {
                return;
            }
            this.isAjax = true;
            Api.get({
                url: "/storage/add.do",
                data: {
                    storage_dto: JSON.stringify(that.postData)
                },
                success: function () {
                    toastr.success('添加成功!', '提示');
                    setTimeout(function () {
                        location.href = 'warehouse.html';
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
        //修改账号
        changeAccount: function () {
            var that = this;
            if (this.isAjax == true) {
                return;
            }
            this.isAjax = true;
            Api.get({
                url: '/storage/update.do',
                data: {
                    storage_dto: JSON.stringify(that.postData)
                },
                success: function () {
                    toastr.success('修改成功!', '提示');
                    setTimeout(function () {
                        location.href = 'warehouse.html';
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

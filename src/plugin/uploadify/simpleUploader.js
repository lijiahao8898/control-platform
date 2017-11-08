/**
 * 采用异步提交的形式上传图片
 *
 * options
 *
 * {
 *  fileObjName,
 *  fileSizeLimit,
 *  fileTypes,
 *  fileTypesDescription,
 *  uploaderUrl,
 *  buttonText,
 *  onUploadStart,
 *  onUploadError,
 *  onUploadProgress,
 *  onUploadSuccess
 * }
 *
 * todo 上传服务器url变更
 * todo ie 浏览器支持
 */
;(function (lib) {
    // 空函数
    function noop() {

    }

    function ImgUpload(opts) {
        this.defaultOptions = {
            formId: 'mk-ajax-upload-form',
            //targetUrl: 'http://b.taojae.com/service.php',
            targetUrl: 'http://media.mockuai.com/upload.php',
            auth_name: 'media_auth_key',
            auth_key: '6r4XkF6EcE',
            fileName: 'file',
            trigger: '.upload-image-trigger',
            postData: {
                biz_code:$.cookie('biz_code'),
                user_id:$.cookie('user_id'),
                parent_id:0
            }
        };
        this.init(opts);
    }

    function addInputAttr(key, val, $form) {
        var $input = $('<input name="' + key + '" type="hidden" value="' + val + '"/>');
        $form.append($input);
    }

    ImgUpload.prototype = {
        init: function (opts) {
            this.opts = $.extend(true, {}, this.defaultOptions, opts);

            if ($('#' + this.opts.formId).length) {
                return this;
            }

            var $form = $('<form method="post" enctype="multipart/form-data" style="display: none">');
            $form.attr('id', this.opts.formId);
            $form.attr('action', this.opts.targetUrl);

            for (key in this.opts.postData) {
                addInputAttr(key, this.opts.postData[key], $form);
            }

            $form.appendTo('body');
            this.$form = $form;

            // 设置上传file字段
            this.setFileInput();

            // 声明好
            this.ajaxSubmit();
            this.addEvent();

            return this;
        },

        addEvent: function () {
            var that = this;

            $('body').on('click', this.opts.trigger, function () {
                if (that.uploading) {
                    return;
                }
                // 缓存当前按钮
                that.currentTrigger = $(this);
                that.$inputFile.click();
            });
        },

        setFileInput: function () {
            var that = this;
            this.$form.find('input[type=file]').remove();
            this.$form.append('<input type="file" name="' + this.opts.fileName + '" />');

            this.$inputFile = this.$form.find('input[type=file]');
            this.$inputFile.change(function () {
                that.$form.submit();
            })
        },
        ajaxSubmit: function () {
            var that = this;
            this.$form.ajaxForm({
                dataType: "json",
                beforeSend: function () {
                    that.uploading = true;
                    that.opts.onUploadStart && that.opts.onUploadStart.call(that);
                },
                uploadProgress: function (event, position, total, percentComplete) {
                    that.opts.onUploadProgress && that.opts.onUploadProgress.call(that, percentComplete);
                },
                success: function (data) {
                    that.opts.onUploadSuccess && that.opts.onUploadSuccess.call(that, data);
                },
                error: function () {
                    that.opts.onUploadError && that.opts.onUploadError.call(that);
                },
                complete: function (xhr) {
                    that.uploading = false;

                    // 重置input file
                    that.setFileInput();
                    that.opts.onUploadComplete && that.opts.onUploadComplete.call(that, xhr);
                }
            });
        }
    };

    lib.imgUpload = ImgUpload;

})(window.lib || (window.lib = {}));

/*global jQuery, Ghost, document, Image, window */
(function ($) {
    "use strict";

    var UploadUi;


    UploadUi = function ($dropzone, settings) {
        var urledit = '<input class="url" type="url" placeholder="http://" style="width: 100%"/>',
            cancel = '<button class="cancel">Simulate Error</button>',
            ok = '<button class="ok">OK</button>';

        $.extend(this, {

            initUrl: function (url) {
                $dropzone.find('.url')[0].value = url;
                
                $dropzone.find('.ok').on('click', function () {
                    var val = $dropzone.find('.url')[0].value;
                    $dropzone.trigger("uploadsuccess", val);
                });
                
                $dropzone.find('.cancel').on('click', function () {
                    $dropzone.trigger("uploadfailure", 'http://');
                });
            },

            init: function () {
                $dropzone.css('background-color','gray');
                $dropzone.append(urledit);
                $dropzone.append(ok);
                $dropzone.append(cancel);
                
                var target = $dropzone.find('.js-upload-target')[0];
                
                if (!target) {
                    this.initUrl('');   
                } else {
                    this.initUrl(target.src);
                }
            }
        });
    };


    $.fn.upload = function (options) {
        var settings = $.extend({
            progressbar: true,
            editor: false
        }, options);

        return this.each(function () {
            var $dropzone = $(this),
                ui;

            ui = new UploadUi($dropzone, settings);
            ui.init();
        });
    };
}(jQuery));
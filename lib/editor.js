

/* global $, _, Showdown, CodeMirror, GHEditorBase */
"use strict";


// Editor with upload features
var GHEditorWithUploads = function() {

    var uriRegex = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i,
    pathRegex = /^(\/)?([^\/\0]+(\/)?)+$/i;

    this.afterRenderPreview = function() {
        $('.js-drop-zone').upload({editor: true});
        $('.js-drop-zone').on('uploadstart', $.proxy(this.disableEditor, this));
        $('.js-drop-zone').on('uploadfailure', $.proxy(this.enableEditor, this));
        $('.js-drop-zone').on('uploadsuccess', $.proxy(this.enableEditor, this));
        $('.js-drop-zone').on('uploadsuccess', this.uploadMgr.handleUpload);
    };

    this.getEditorValue = function() {
        return this.uploadMgr.getEditorValue();
    };

    this.renderImageTag = function(match, key, alt, src) {
        var result = "";

        if (src && (src.match(uriRegex) || src.match(pathRegex))) {
            result = '<img class="js-upload-target" src="' + src + '"/>';
        }
        return '<section id="image_upload_' + key + '" class="js-drop-zone">' +
                result +
               '<div class="description">' + alt + '</div>' +
               '</section>';
    };

};

GHEditorWithUploads.prototype = new GHEditorBase();
var oldInit = GHEditorWithUploads.prototype.initMarkdown;
function newInit(self) {
    oldInit(self);
    self.uploadMgr = new UploadManager(self.editor, self.imageMarkdownRegex);
};
GHEditorWithUploads.prototype.initMarkdown = newInit;
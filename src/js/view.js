/*
 * kintone thread plugin
 * Copyright (c) 2015 kiku38
 *
 * Dual licensed under the MIT or GPL Version 3 licenses.
 */

// jQuery.noConflict();
(function($) {
    "use strict";
    window.__kthread = window.__kthread || {};
    var _FILE = new window.__kthread.FileController();
    var API_TOKEN;
    var HANDLENAME;
    var LOGINUSER = {
        name: kintone.getLoginUser().name,
        code: kintone.getLoginUser().code
    };
    var USER_PAGE_URL = kintone.api.url('/k/').replace('\.json', '') + '#\/people\/user\/';
    var IS_ANONYMOUS = false;

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function viewDate(value) {
        return moment(value).format('YYYY/MM/DD HH:mm:ss');
    }

    window.__kthread.ViewController = function() {
        this.$baseView;
        this.$commentView;
        this.maxCommentCount;

        this.initialize = function(token) {
            API_TOKEN = token;
            this.maxCommentCount = 1;
            this.changeAnonymousMode();
        };

        this.getHandleName = function() {
            return HANDLENAME;
        };

        this.getLoginUserInfo = function() {
            return LOGINUSER;
        };

        this.isAnonymous = function() {
            return IS_ANONYMOUS;
        };

        this.changeAnonymousMode = function(){
            if ($('#kthread_isAnonymous').size() > 0) {
                IS_ANONYMOUS = $('#kthread_isAnonymous').prop('checked');
            } else {
                IS_ANONYMOUS = false;
                HANDLENAME = LOGINUSER.name;
            }
            if (IS_ANONYMOUS) {
                HANDLENAME = '名無しさん';
                $('#kthread_dispname').prop('disabled', false);
            } else {
                HANDLENAME = LOGINUSER.name;
                $('#kthread_dispname').prop('disabled', true);

            }
            $('#kthread_dispname').val(HANDLENAME);
        };

        this.getComment = function() {
            var comment = CKEDITOR.instances.kthread_message.getData();
            //アンカー変換処理
            // var re = />\&gt;\&gt;(\d+)</g;
            // var match;
            // var result = [];
            // // >>xxx形式の文字列を取得
            // while (match = re.exec(comment)) {
            //     result.push(match);
            // }
            // // >>xxxをリンクに置き換え
            // for(var i in result) {
            //     var m1 = result[i][0];
            //     var m2 = result[i][1];
            //     comment = comment.replace(m1, '><a href="#bulletin_list_' + m2 + '">&gt;&gt;' + m2 + '</a><');
            // }
            return comment;
        };

        this.getFiles = function() {
            return $("#kthread_files")[0].files;
        };

        this.viewThread = function($elRecord) {
            if ($('#kintone_thread_view').size() !== 0) { return; }
            $elRecord.append($('<div id="kintone_thread_view" class="thread-view"></div>'));
            this.$baseView = $elRecord;
            this.$commentView = $('#kintone_thread_view');
        };

        this.viewForm = function(writeThread, loadTread) {
            if ($('#thread-form').size() !== 0) { return; }
            this.$baseView.append('\
                <div id="kthread_form" class="thread-form">\
                    <div class=form-input>\
                    <input id="kthread_reloadbtn" type="button" value="更新">&nbsp;&nbsp;\
                    <input id="kthread_writebtn" type="button" value="投稿">&nbsp;&nbsp;\
                    <input type="checkbox" id="kthread_isAnonymous">&nbsp;匿名モード&nbsp;&nbsp;\
                    <input id="kthread_dispname" type="text" size="46" maxlength="30" placeholder="名前" value="' + HANDLENAME + '" " disabled>\
                        <textarea id="kthread_message" rows="5" wrap="off"></textarea>\
                        <label class="control-label">Select File</label>\
                        <input id="kthread_files" type="file" multiple class="file-loading" ="true">\
                    </div>\
                </div>');
            // ファイルInput設定
            $("#kthread_files").fileinput({
                browseLabel: 'ファイル選択',
                removeLabel: '削除',
                showUpload: false,
                maxFileCount: 6,
                maxFileSize: 102400,
                allowedPreviewTypes: ['image', 'html', 'text', 'video', 'audio', 'flash'],
                mainClass: 'input-group-lg'
            });
            // リッチテキスト設定
            CKEDITOR.replace('kthread_message');
            CKEDITOR.config.toolbar = [
                // ['Source','-','Save','NewPage','Preview','-','Templates'],
                // ['Cut','Copy','Paste','PasteText','PasteFromWord','-','Print','SpellChecker'],
                // ['Undo','Redo','-','Find','Replace','-','SelectAll','RemoveFormat'],
                // ['Form','Checkbox','Radio','TextField','Textarea','Select','Button','ImageButton','HiddenField'],
                // '/',
                ['Bold','Italic','Underline','Strike'],//,'-','Subscript','Superscript'],
                ['NumberedList','BulletedList'],//,'-','Outdent','Indent','Blockquote'],
                ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
                ['Link','Unlink'],//,'Anchor'],
                [/*'Image',*/'Table','HorizontalRule','Smiley','SpecialChar'],//,'PageBreak'],
                '/',
                ['TextColor','BGColor'],
                ['Styles','Format','Font','FontSize']
                // ['ShowBlocks']
            ];
            // 匿名モード変換処理
            $('#kthread_isAnonymous').change(this.changeAnonymousMode);
            // 「書き込む」ボタン押下処理 - 匿名の場合nameをセット
            $('#kthread_writebtn').click(function(){
                if (IS_ANONYMOUS) {
                    var dispname = $('#kthread_dispname').val();
                    if (dispname && dispname.length > 0) {
                        HANDLENAME = dispname;
                    } else {
                        alert('名前が未入力です');
                        return;
                    }
                };
                writeThread();
            });
            // 更新ボタン押下処理
            $('#kthread_reloadbtn').click(loadTread);
        };

        this.viewComment = function(keys, tables) {
            for (var i = this.maxCommentCount; tables.length > i; i++) {
                var table = tables[i].value;
                var id = escapeHtml(table[keys.id].value);
                var date = escapeHtml(viewDate(table[keys.date].value));
                var message = table[keys.message].value.replace('<script>','').replace('</script>','');
                var userid = escapeHtml(table[keys.userid].value);
                var name = escapeHtml(table[keys.name].value);
                if (table[keys.user].value.length > 0) {
                    var ucode = table[keys.user].value[0].code;
                    name = '<a href="' + USER_PAGE_URL + ucode + '" target="_blank">' + name + '</a>';
                }
                var tab = '&nbsp;&nbsp;&nbsp;&nbsp;';

                var comment = '\
                    <div id="bulletin_list_' + id + '" class="thread-comment">\
                        <hr>\
                        <b class="thread-comment-title">' + id + tab + '名前：' + name + tab + tab + date + tab + tab + 'ID: ' + userid + '</b>\
                        <div class="thread-comment-body">' + message + '</div>\
                    </div>';
                this.$commentView.append($(comment));
                this.viewFile(table[keys.file].value, $('#bulletin_list_' + i));
            }
            this.maxCommentCount = i;
        };

        this.viewFile = function(val, $target) {
            if(val.length === 0) { return; }

            var showFile = function(data) {
                for (var i in data) {
                    if (data[i].name.match(/\.jpeg$|\.jpg$|\.png$|\.bmp$|\.gif|\.ico$/)) {
                        $target.append('<a class="kthread_image" href="' + data[i].url + '" target="_blank"><img src="' + data[i].url + '" alt="' + data[i].name + '"></a>');
                    } else {
                        $target.append('<br><a href="' + data[i].url + '" download="' + data[i].name + '">' + data[i].name + '</a>');
                    }
                }
            };
            return _FILE.downLoadFiles(val).then(function(data) {
                showFile(data);
            });
        };

        this.clearForm = function() {
            CKEDITOR.instances.kthread_message.setData("");
            $("#kthread_files").fileinput('clear');
        };
    };


    // spinner
    window.__kthread.Spinner = function() {
        this.spinner = {};

        this.showSpinner = function() {
            if ($(".kintone-spinner").length === 0) {

                this.spinner = new Spinner({
                    lines: 13,
                    length: 28,
                    width: 14,
                    radius: 42,
                    scale: 1,
                    corners: 1,
                    color: "#FFF",
                    opacity: 0.25,
                    rotate: 0,
                    direction: 1,
                    speed: 1,
                    trail: 60,
                    fps: 20,
                    zIndex: 2e9,
                    className: "spinner",
                    top: "50%",
                    left: "50%",
                    shadow: false,
                    hwaccel: false,
                    position: "fixed"
                });

                // spinner back ground
                var spin_bg_div = $('<div id ="kintone-spin-bg" class="kintone-spinner"></div>');
                $(document.body).append(spin_bg_div);

                $(spin_bg_div).css({
                    "position": "fixed",
                    "top": 0,
                    "left": "0px",
                    "z-index": "500",
                    "width": "100%",
                    "height": "100%",
                    "background-color": "#000",
                    "opacity": "0.5",
                    "filter": "alpha(opacity=50)",
                    "-ms-filter": "alpha(opacity=50)"
                });
            }
            $(".kintone-spinner").show();
            this.spinner.spin($("html")[0]);
        };

        this.hideSpinner = function() {
            $(".kintone-spinner").hide();
            this.spinner.stop();
        };
    };

})(jQuery);


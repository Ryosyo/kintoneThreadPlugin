/*
 * kintone thread plugin
 * Copyright (c) 2015 kiku38
 *
 * Dual licensed under the MIT or GPL Version 3 licenses.
 */

// jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";

    var APP_ID = kintone.app.getId();
    var RECORD_ID, API_TOKEN, FIELD, LOADTIME;
    var _FILE = new window.__kthread.FileController();
    var _VIEW = new window.__kthread.ViewController();
    var _SPIN = new window.__kthread.Spinner();

    var config = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (config) {
        FIELD = {
            "title": config['Title'],
            "space": config['Space'],
            "table": config['Table'],
            "id": config['Id'],
            "date": config['Datetime'],
            "name": config['Name'],
            "user": config['User'],
            "userid": config['UserId'],
            "message": config['Message'],
            "file": config['File']
        };
        API_TOKEN = config['ApiToken'];
        LOADTIME = parseInt(config['LoadTime']);
    } else {
        return;
    }
    var USERID = (function() {
        var str = sessionStorage.getItem('kintone-thread-plugin');
        if (!str || str.length === 0) {
            var char = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
            var len = char.length;
            for (var i = 0; i < 11; i++) {
                var rand = parseInt(Math.random()*len);
                str += char.charAt(rand);
            }
        }
        sessionStorage.setItem('kintone-thread-plugin', str);
    })();

    function nowDate() {
        return moment().utc().format('YYYY-MM-DDTHH:mmZ');
    }

    function loadThread(){
        var body = {
            "app": APP_ID,
            "id": RECORD_ID
        };
        kintone.api("/k/v1/record", "GET", body).then(function(resp) {
            if (resp.record) {
                return resp.record;
            }
        }).then(function(record) {
            var tables = record[FIELD.table].value;
            _VIEW.viewComment(FIELD, tables);
            if (LOADTIME > 0) { setTimeout(loadThread, LOADTIME); }
        });
    }

    function writeThread() {
        function addThread(tVal, revisionId, fileKey) {
            var id = tVal.length;
            var putbody = {
                [FIELD.table]: {"value": tVal}
            };
            var tval = {};
            tval.value = {};
            tval.value[FIELD.id] = {"value": id};
            tval.value[FIELD.date] = {"value": nowDate()};
            tval.value[FIELD.name] = {"value": _VIEW.getHandleName()};
            tval.value[FIELD.message] = {"value": _VIEW.getComment()};
            tval.value[FIELD.userid] = {"value": sessionStorage.getItem('kintone-thread-plugin')};
            if (fileKey && fileKey.length > 0) {tval.value[FIELD.file] = {"value": fileKey}; }
            if (!_VIEW.isAnonymous()) {
                tval.value[FIELD.user] = {"value": [
                    {"code": _VIEW.getLoginUserInfo().code}
                ]};
            }
            putbody[FIELD.table].value[id] = tval;

            var body = {
                "app": APP_ID,
                "id": RECORD_ID,
                "revision": revisionId ,
                "record": putbody
            };

            var header = {
                "X-Cybozu-API-Token": API_TOKEN,
                "Content-Type": "application/json"
            };
            return kintone.proxy(kintone.api.url('/k/v1/record'), 'PUT', header, JSON.stringify(body)).then(function(resp) {
                if(JSON.parse(resp[0]).revision) {
                    loadThread();
                    _VIEW.clearForm();
                } else {
                    return writeThread();
                }
            });
        }
        _SPIN.showSpinner();

        // ファイル追加処理
        var $elfile = _VIEW.getFiles();
        var tempfiles = [];
        if ($elfile && $elfile.length > 0) {
            for (var i = 0; $elfile.length > i; i++) {
                var file = $elfile[i];
                tempfiles.push({
                   "name": file.name,
                   "blob": new Blob([file], {"type": file.type})
                });
            }
        }

        var changeRecord;
        return kintone.api("/k/v1/record", "GET", {"app": APP_ID, "id": RECORD_ID}).then(function(resp) {
            if (resp.record) {
                changeRecord = resp.record;
                if (changeRecord[FIELD.table].value.length <= 1000) {
                    if (tempfiles.length > 0) {
                        return _FILE.upLoadFiles(tempfiles).then(function(filekeys) {
                            return filekeys;
                        });
                    }
                } else {
                    alert('このスレッドは1000を超えました。\nもう書けないので、新しいスレッドを立ててください。')
                }
            }
        }).then(function(filekeys) {
            _SPIN.hideSpinner();
            var tableval = changeRecord[FIELD.table].value;
            var revid = parseInt(changeRecord.$revision.value);
            return addThread(tableval, revid, filekeys).then(function() {
            });
        }).catch(function(e) {
            _SPIN.hideSpinner();
            alert('error: ' + e.message);
        });
    }

    var initShow = function() {
        var $title = $(kintone.app.record.getFieldElement(FIELD.title));
        $title.css('font-weight', 'bold');
        $title.css('font-size', '36px');
        $title.css('background-color', '#CCC');
    };

    var initThread = function(event) {
        RECORD_ID = kintone.app.record.getId();
        var $space = $(kintone.app.record.getSpaceElement(FIELD.space));
        _VIEW.initialize(API_TOKEN);
        _VIEW.viewThread($space);
        _VIEW.viewForm(writeThread, loadThread);
        initShow();
        loadThread();
        return event;
    };

    kintone.events.on('app.record.detail.show', initThread);

})(jQuery, kintone.$PLUGIN_ID);


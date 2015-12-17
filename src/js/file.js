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
    window.__kthread.FileController = function() {

        this.downLoadFiles = function(filevalue) {
            var promise = new kintone.Promise(function(resolve, reject) {
                var fileDatas = [];
                var tempCnt = filevalue.length;

                function fetchBlobArray(value, cnt, files, fileSize) {
                    var key = value[cnt].fileKey;
                    var name = value[cnt].name;
                    var url = kintone.api.url('/k/v1/file', true) + '?fileKey=' + key;

                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.responseType = 'blob';
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    xhr.onreadystatechange = function() {
                        if ((xhr.readyState === 4) && (xhr.status === 200)) {
                            if (window.URL || window.webkitURL) {
                                var u = window.URL || window.webkitURL;
                                var data = {
                                    name: name,
                                    blob: xhr.response,
                                    url: u.createObjectURL(xhr.response)
                                };
                                files.push(data);
                            }
                            var nextcnt = cnt + 1;
                            if (nextcnt < fileSize) {
                                return fetchBlobArray(value, nextcnt, files, fileSize);
                            }
                            resolve(files);

                        } else if (xhr.status !== 200) {
                            reject(new Error(xhr.statusText));
                        }
                    };
                    xhr.send();
                }
                return fetchBlobArray(filevalue, 0, fileDatas, tempCnt);
            });
            return promise;
        };

        this.upLoadFiles = function(filevalue) {
            var promise = new kintone.Promise(function(resolve, reject) {

                function upLoad(value, cnt, keys) {
                    var fileName = value[cnt]['name'];
                    var fileData = value[cnt]['blob'];

                    var xmlhttp = new XMLHttpRequest();
                    xmlhttp.open("POST", encodeURI('/k/v1/file.json'), true);
                    xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    xmlhttp.onreadystatechange = function(resp) {
                        if (xmlhttp.readyState === 4) {
                            var fileKey = {
                                fileKey: JSON.parse(xmlhttp.responseText).fileKey
                            };
                            keys.push(fileKey);

                            var fcnt = value.length;
                            if (cnt !== fcnt - 1) {
                                return upLoad(value, cnt + 1, keys);
                            }
                            resolve(keys);

                        } else if (xmlhttp.status !== 200) {
                            reject(new Error(xmlhttp.statusText));
                        }
                    };

                    var formData = new FormData();
                    formData.append("__REQUEST_TOKEN__", kintone.getRequestToken());
                    formData.append("file", fileData, fileName);

                    xmlhttp.send(formData);
                }
                var keys = [];
                return upLoad(filevalue, 0, keys);
            });
            return promise;
        };
    };
})(jQuery);


/*
 * kintone thread plugin
 * Copyright (c) 2015 kiku38
 *
 * Dual licensed under the MIT or GPL Version 3 licenses.
 */

jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";

    $(document).ready(function() {

        var terms = {
            'en': {
                'apitoken': 'API Token',
                'apitoken_description': '',
                'title': 'Title Field',
                'title_description': 'Field Type: SINGLE_LINE_TEXT',
                'space': 'Space Field',
                'space_description': 'Field Type: SPACER',
                'table': 'Table Field',
                'table_description': 'Field Type: TABLE',
                'id': 'Comment ID Field',
                'id_description': 'Field Type: SINGLE_LINE_TEXT, NUMBER',
                'datetime': 'Comment DateTime Field',
                'datetime_description': 'Field Type: DATETIME',
                'name': 'Comment Display Name Field',
                'name_description': 'Field Type: SINGLE_LINE_TEXT',
                'user': 'Comment User Field',
                'user_description': 'Field Type: USER_SELECT',
                'userid': 'Comment User ID Field',
                'userid_description': 'Field Type: SINGLE_LINE_TEXT',
                'message': 'Comment Message Field',
                'message_description': 'Field Type: MULTI_LINE_TEXT, RICH_TEXT',
                'file': 'Comment File Field',
                'file_description': 'Field Type: FILE',
                'loadtime': 'Auto Load Time(sec)',
                'loadtime_description': '',
                'loadtime_default': 'not Auto Loding',
                'error': 'Error: ',
                'plugin_submit': '     Save     ',
                'plugin_cancel': '    Cancel    ',
                'required_field': 'Required field is empty.'
            },
            'ja': {
                'apitoken': 'APIトークン',
                'apitoken_description': '「閲覧」「編集」の権限があるAPIトークンを設定してください',
                'title': 'タイトルフィールド',
                'title_description': 'タイトルに設定するフィールドを選択してください',
                'space': 'スレッド表示領域',
                'space_description': 'スレッド表示領域に設定するスペースフィールドを選択してください',
                'table': '投稿用テーブル',
                'table_description': '投稿用のテーブルフィールドを選択してください',
                'id': '投稿コメントID',
                'id_description': '投稿コメントIDに設定するフィールドを選択してください',
                'datetime': '投稿日時',
                'datetime_description': '投稿日時に設定するフィールドを選択してください',
                'name': '投稿者名（ハンドルネーム）',
                'name_description': '投稿者名に設定するフィールドを選択してください',
                'user': '投稿ユーザー(kintoneユーザー)',
                'user_description': '投稿ユーザーに設定するフィールドを選択してください',
                'userid': '投稿者ID',
                'userid_description': '投稿者IDに設定するフィールドを選択してください',
                'message': 'コメント本文',
                'message_description': 'コメント本文に設定するフィールドを選択してください',
                'file': 'コメントの添付ファイル',
                'file_description': 'コメントの添付ファイルに設定するフィールドを選択してください',
                'loadtime': '自動描画更新（秒）',
                'loadtime_description': '自動描画更新を選択してください',
                'loadtime_default': '自動更新なし',
                'error': 'Error: ',
                'plugin_submit': '     保存     ',
                'plugin_cancel': '  キャンセル  ',
                'required_field': '入力に誤りがあります'
            }
        };

        // To switch the display by the login user's language (English display in the case of Chinese)
        var lang = kintone.getLoginUser().language;
        var i18n = (lang in terms) ? terms[lang] : terms['en'];

        var configHtml = $('#kthread_plugin').html();
        var tmpl = $.templates(configHtml);
        $('div#kthread_plugin').html(tmpl.render({'terms': i18n}));

        // Set in the item selection box retrieves the form information design
        kintone.api(kintone.api.url('/k/v1/preview/form', true), 'GET', {'app': kintone.app.getId()}, function(resp) {
            for (var i in resp.properties) {
                var prop = resp.properties[i];

                //default select menu option
                switch (prop['type']) {
                case 'SPACER':
                    $('#kthread_space').append($('<option>').text(prop['elementId']).val(prop['elementId']));
                    break;
                case 'SINGLE_LINE_TEXT':
                    $('#kthread_title').append($('<option>').text(prop['label']).val(prop['code']));
                    break;
                case 'SUBTABLE':
                    $('#kthread_table').append($('<option>').text(prop['code']).val(prop['code']));

                    for (var j = 0; prop.fields.length > j; j++ ) {
                        var tprop = prop.fields[j];
                        switch (tprop['type']) {
                        case 'SINGLE_LINE_TEXT':
                            $('#kthread_id').append($('<option>').text(tprop['label']).val(tprop['code']));
                            $('#kthread_name').append($('<option>').text(tprop['label']).val(tprop['code']));
                            $('#kthread_userid').append($('<option>').text(tprop['label']).val(tprop['code']));
                            break;
                        case 'NUMBER':
                            $('#kthread_id').append($('<option>').text(tprop['label']).val(tprop['code']));
                            break;
                        case 'USER_SELECT':
                            $('#kthread_user').append($('<option>').text(tprop['label']).val(tprop['code']));
                            break;
                        case 'RICH_TEXT':
                        case 'MULTI_LINE_TEXT':
                            $('#kthread_message').append($('<option>').text(tprop['label']).val(tprop['code']));
                            break;
                        case 'FILE':
                            $('#kthread_file').append($('<option>').text(tprop['label']).val(tprop['code']));
                            break;
                        case 'DATETIME':
                            $('#kthread_datetime').append($('<option>').text(tprop['label']).val(tprop['code']));
                            break;
                        default:
                            break;
                        }
                    }
                    break;
                default:
                    break;
                }
            }

            // Get the plug-in information to set the definition data
            var config = kintone.plugin.app.getConfig(PLUGIN_ID);
            $('#kthread_apitoken').val(config['ApiToken']);
            $('#kthread_title').val(config['Title']);
            $('#kthread_space').val(config['Space']);
            $('#kthread_table').val(config['Table']);
            $('#kthread_id').val(config['Id']);
            $('#kthread_datetime').val(config['Datetime']);
            $('#kthread_name').val(config['Name']);
            $('#kthread_user').val(config['User']);
            $('#kthread_userid').val(config['UserId']);
            $('#kthread_message').val(config['Message']);
            $('#kthread_file').val(config['File']);
            $('#kthread_loadtime').val(config['LoadTime']);
        });

        // Save the value
        $('#kthread_plugin_submit').click(function() {

            // Set the definition data
            var config = {};
                config['ApiToken'] = $('#kthread_apitoken').val();
                config['Title'] = $('#kthread_title').val();
                config['Space'] = $('#kthread_space').val();
                config['Table'] = $('#kthread_table').val();
                config['Id'] = $('#kthread_id').val();
                config['Datetime'] = $('#kthread_datetime').val();
                config['Name'] = $('#kthread_name').val();
                config['User'] = $('#kthread_user').val();
                config['UserId'] = $('#kthread_userid').val();
                config['Message'] = $('#kthread_message').val();
                config['File'] = $('#kthread_file').val();
                config['LoadTime'] = $('#kthread_loadtime').val();

            kintone.plugin.app.setConfig(config);
        });

        // Clear the value
        $('#kthread_plugin_cancel').click(function() {
            history.back();
        });

        // To HTML escape
        function escapeHtml(htmlstr) {
            return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }

    });

})(jQuery, kintone.$PLUGIN_ID);

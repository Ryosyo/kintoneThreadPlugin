
#kintone Thread Plugin

##アプリの設定

###フォーム設定
|項目名|フィールド型|説明|
|:--|:--|:--|
|タイトル|文字列（1行）|スレッドのタイトル|
|スレッド表示領域| スペース|スレッドを表示するスペース|
|投稿用テーブル|テーブル|投稿用のサブテーブル|
|投稿コメントID|文字列（1行）, 数値|コメントのID(index)保持用|
|投稿日時|日時|投稿日時<br>秒数は固定で0秒となる|
|投稿者名<br>(ハンドルネーム)|文字列（1行）|コメント投稿者の表示名<br>匿名の場合はハンドルネーム<br>匿名ではない場合はkintoneユーザー表示名|
|投稿ユーザー<br>(kintoneユーザー）|ユーザー選択|コメント投稿者のkintoneユーザー情報<br>匿名ではない場合のみ登録される|
|投稿者ID|文字列（1行）|投稿ユーザーID<br>匿名モードの切り替えではリセットされない<br>とあるタイミングでリセットされる|
|コメント本文|文字列（複数行）|コメント |
|コメントの添付ファイル|添付ファイル|添付ファイル|

###プラグインの設定
1. [プラグインインストール方法](https://help.cybozu.com/ja/k/admin/plugin.html)
2. [アプリにプラグインを適用する方法](https://help.cybozu.com/ja/k/user/plugin.html)
3. プラグインの設定項目について

|項目                       | 設定するフィールド型         |
|:---------------------------|:---------------------------|
| API Token                   | [APIトークンの取得方法](https://cybozudev.zendesk.com/hc/ja/articles/202463840) <br>閲覧、編集にチェックを入れる                     |
| タイトル                    | 文字列（1行）               |
| スレッド表示領域             | スペース                    |
| 投稿用テーブル               | テーブル                    |
| 投稿コメントID               | 文字列（1行）, 数値          |
| 投稿日時                     | 日時                       |
| 投稿者名<br>(ハンドルネーム)    | 文字列（1行）             |
| 投稿ユーザー<br>(kintoneユーザー)| ユーザー選択             |
| 投稿者ID                     | 文字列（1行）               |
| コメント本文                  | 文字列（複数行）           |
| コメントの添付ファイル        | 添付ファイル               |
| 自動描画更新                 | 更新なし、15秒、30秒、60秒   |



##LICENSE
This software is released Dual licensed under the MIT or GPL Version 3 licenses.



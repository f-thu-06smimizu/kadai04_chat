// APIキーはGitHub公開のため、空（""）
const firebaseConfig = {
  // APIキーは削除済み想定
  apiKey: "",
  authDomain: "gs-js03.firebaseapp.com",
  projectId: "gs-js03",
  storageBucket: "gs-js03.firebasestorage.app",
  messagingSenderId: "3286387248",
  appId: "1:3286387248:web:48f284cf4dcf9280a67bf5",
};

// Firebaseの初期化とデータベース参照の設定
// CDN版のFirebase SDKの関数呼び出し形式
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const dbRef = database.ref("chat_room_a");

// タイムスタンプ整形関数 
function convertTimestampToDatetime(timestamp) {
  const _d = timestamp ? new Date(timestamp) : new Date();
  const Y = _d.getFullYear();
  const m = (_d.getMonth() + 1).toString().padStart(2, "0");
  const d = _d.getDate().toString().padStart(2, "0");
  const H = _d.getHours().toString().padStart(2, "0");
  const i = _d.getMinutes().toString().padStart(2, "0");
  const s = _d.getSeconds().toString().padStart(2, "0");
  return `${Y}/${m}/${d} ${H}:${i}:${s}`;
}

// $(function() { ... }); で jQueryの実行タイミングを保証
$(function () {
  // メッセージ送信処理
  $("#send").on("click", function () {
    const nameVal = $("#name").val();
    const textVal = $("#text").val();

    if (textVal === "") {
      alert("メッセージを入力してください。");
      return;
    }

    // 二重表示解消のためのIDを生成
    const tempId = Date.now();

    // ローカル表示用の処理（送信直後の確認用）
    const now = convertTimestampToDatetime(tempId);
    const localHtml = `
            <li class="temp-msg" data-temp-id="${tempId}" style="opacity: 0.6; font-style: italic;">
                <span class="name">${nameVal}</span>
                <span class="text">${textVal}</span>
                <span class="datetime">${now} (送信中...)</span>
            </li>
        `;
    $("#output").append(localHtml);

    // データベースに送るデータ構造
    const postData = {
      name: nameVal,
      text: textVal,
      // ローカル表示と紐付けるためのIDをFirebaseにも送る
      tempId: tempId,
      // serverTimestamp() は firebase.database.ServerValue.TIMESTAMP に変更
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    };

    // データをFirebaseにプッシュ
    dbRef.push(postData);

    $("#text").val("");
  });

  // メッセージ受信と表示処理（リアルタイム監視）
  dbRef.on("child_added", function (data) {
    const item = data.val();

    // 二重表示解消のための処理: 古いローカル表示要素の削除
    // Firebaseから返されたtempIdを持つ要素を探して削除
    if (item.tempId) {
      $(`#output li[data-temp-id="${item.tempId}"]`).remove();
    }

    // 時刻整形
    const datetime = item.timestamp
      ? convertTimestampToDatetime(item.timestamp)
      : "送信中";

    const html = `
            <li>
                <span class="name">${item.name}</span>
                <span class="text">${item.text}</span>
                <span class="datetime">${datetime}</span>
            </li>
        `;

    // output要素の末尾に追加
    $("#output").append(html);
  });
});

// index.htmlでCDNを読み込んでいるため、ここではimportは使用しない
const firebaseConfig = {
  apiKey: "AIzaSyBBDlMsMIfpzH6IDHFjLun4wbtkcdi_FSo",
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
// ref(database, "chat_room_a") ではなく database.ref() を使用
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

//　$(function() { ... }); で jQueryの実行タイミングを保証
$(function () {
// メッセージ送信処理
  $("#send").on("click", function () {
    const nameVal = $("#name").val();
    const textVal = $("#text").val();

    if (textVal === "") {
      alert("メッセージを入力してください。");
      return;
    }

    // ローカル表示用の処理（送信直後の確認用）
    const now = convertTimestampToDatetime(Date.now());
    const localHtml = `
            <li style="opacity: 0.6; font-style: italic;">
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
      // serverTimestamp() は firebase.database.ServerValue.TIMESTAMP に変更
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    };

    // データをFirebaseにプッシュ
    // push(dbRef, postData) から dbRef.push(postData) に変更
    dbRef.push(postData);

    $("#text").val("");
  });

  // メッセージ受信と表示処理（リアルタイム監視）
  dbRef.on("child_added", function (data) {
    const item = data.val();

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

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { google } = require('googleapis');

admin.initializeApp();

const oauth2Client = new google.auth.OAuth2(
  process.env.DRIVE_CLIENT_ID,
  process.env.DRIVE_CLIENT_SECRET
);
oauth2Client.setCredentials({ refresh_token: process.env.DRIVE_REFRESH_TOKEN });

function getDrive() {
  return google.drive({ version: 'v3', auth: oauth2Client });
}


// 「0 9 1 * *」とCloud Schedulerのcron形式でも指定をする
// https://console.cloud.google.com/cloudscheduler?project=netflix-clone-course-39cf8

exports.saveLogsToCSV = functions.pubsub.topic('firebase-schedule-saveLogsToCSV')
  .onPublish(async (message) => {

  console.log('saveLogsToCSV関数が実行されました');
  const db = admin.firestore();
  
  // ログ取得処理
  const snap = await db.collection("logs").get();
  // Firestoreのデータを配列化
  const logArray = [];
  snap.forEach(doc => {
    const d = doc.data();
    logArray.push(d);
  });

  // 日時で昇順ソート（最新が下）
  logArray.sort((a, b) => {
    const at = a.viewedAt instanceof admin.firestore.Timestamp ? a.viewedAt.toDate() : new Date(a.viewedAt);
    const bt = b.viewedAt instanceof admin.firestore.Timestamp ? b.viewedAt.toDate() : new Date(b.viewedAt);
    return at - bt;
  });

  const rows = [["日時", "メールアドレス", "動画タイトル", "動画サマリー", "動画ID"]];
  logArray.forEach(d => {
    // 日本時間で日時を出力
    let dateStr = "";
    if (d.viewedAt) {
      const dateObj = d.viewedAt instanceof admin.firestore.Timestamp ? d.viewedAt.toDate() : new Date(d.viewedAt);
      dateStr = dateObj.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    }
    rows.push([
      dateStr,
      d.email || "",
      d.videoTitle || "",
      d.videoSummary || "",
      d.videoId || ""
    ]);
  });
  
  const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const fileName = `view_logs_${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}.csv`;

  // 一時ファイルに保存
  const tempFilePath = path.join(os.tmpdir(), fileName);
  fs.writeFileSync(tempFilePath, csv);

  await uploadToDrive(fileName, tempFilePath);

  // 一時ファイル削除
  fs.unlinkSync(tempFilePath);
  console.log("ログCSV保存処理完了:", fileName);
});

// ファイルアップロード関数
async function uploadToDrive(fileName, filePath) {
  console.log('Google Driveアップロード開始:', fileName);

  const drive = getDrive();
  const folderId = process.env.DRIVE_FOLDER_ID;

  const res = await drive.files.create({
    resource: { name: fileName, parents: [folderId] },
    media: { mimeType: 'text/csv', body: fs.createReadStream(filePath) },
    fields: 'id',
  });
  console.log('Google Driveアップロード成功 ID:', res.data.id);
}
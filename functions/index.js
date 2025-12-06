const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {Storage} = require('@google-cloud/storage');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { google } = require('googleapis');
const { OAuth2 } = google.auth; // 【追加】OAuth2を取り出す

admin.initializeApp();

const CLIENT_ID = process.env.DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.DRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.DRIVE_REFRESH_TOKEN;


// 【修正】OAuth2クライアントを作成して認証情報をセットする
const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET);
oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN
});

// 【修正】作成したOAuth2クライアントをDriveに渡す
const drive = google.drive({ 
  version: 'v3', 
  auth: oauth2Client 
});

// 検証用関数（10分ずつログcsvファイルを取得する　※確認後削除する）
exports.saveLogsToCSV = functions.pubsub.schedule('every 10 minutes').onRun(async (context) => {

// '1 of month 00:00' で「毎月1日の09:00」を指定
// .timeZone('Asia/Tokyo') を追加して、日本時間で作動させる
// 「0 9 1 * *」とCloud Schedulerのcron形式でも指定をする
// https://console.cloud.google.com/cloudscheduler?project=netflix-clone-course-39cf8

// exports.saveLogsToCSV = functions.pubsub.schedule('1 of month 09:00')
//   .timeZone('Asia/Tokyo')
//   .onRun(async (context) => {

  console.log('saveLogsToCSV関数が実行されました');
  const db = admin.firestore();
  
  // ログ取得処理
  const snap = await db.collection("logs").get();
  const rows = [["日時", "メールアドレス", "動画タイトル", "動画サマリー", "動画ID"]];
  snap.forEach(doc => {
    const d = doc.data();
    rows.push([
      d.viewedAt instanceof admin.firestore.Timestamp
        ? d.viewedAt.toDate().toLocaleString()
        : (d.viewedAt ? new Date(d.viewedAt).toLocaleString() : ""),
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

  try {
    // Google Driveにアップロード
    await uploadToDrive(fileName, tempFilePath);
  } catch (error) {
    console.error("Driveアップロードエラー:", error);
  }

  // Google Cloud Storageにアップロード
  const bucket = admin.storage().bucket('netflix-clone-course-39cf8.firebasestorage.app');
  await bucket.upload(tempFilePath, {destination: fileName});

  // 一時ファイル削除
  fs.unlinkSync(tempFilePath);
  console.log("ログCSV保存処理完了:", fileName);
});

// ファイルアップロード関数
async function uploadToDrive(fileName, filePath) {
  console.log('Google Driveアップロード開始:', fileName);
  
  // 共有フォルダのID（あなたの指定したもの）
  const folderId = '1muOnOiY14IYxZDpMVYSFVD-hf7qWY0xS';

  const fileMetadata = {
    name: fileName,
    parents: [folderId] // このフォルダの中に保存
  };
  const media = {
    mimeType: 'text/csv',
    body: fs.createReadStream(filePath),
  };

  const res = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });
  console.log('Google Driveアップロード成功 ID:', res.data.id);
}
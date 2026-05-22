import { db } from '../firebase';
import {
  doc, setDoc, getDoc, collection, getDocs, deleteDoc, addDoc
} from 'firebase/firestore';

export const addToMyList = async (video, user) => {
  if (!user) return;
  const docId = video.id || encodeURIComponent(video.driveLink);
  await setDoc(doc(db, 'users', user.uid, 'mylist', docId), video);
};

export const fetchMyList = async (user) => {
  if (!user) return [];
  const snap = await getDocs(collection(db, 'users', user.uid, 'mylist'));
  return snap.docs.map(d => d.data());
};

export const addToHistory = async (video, user) => {
  if (!user) return;
  const docId = video.id || encodeURIComponent(video.driveLink);
  await setDoc(doc(db, 'users', user.uid, 'history', docId), {
    ...video,
    viewedAt: new Date(),
  });
};

export const fetchHistory = async (user) => {
  if (!user) return [];
  const snap = await getDocs(collection(db, 'users', user.uid, 'history'));
  return snap.docs
    .map(d => d.data())
    .sort((a, b) => (b.viewedAt?.seconds || 0) - (a.viewedAt?.seconds || 0));
};

export const addViewLog = async (user, video) => {
  if (!user || !video) return;
  await addDoc(collection(db, 'logs'), {
    viewedAt: new Date(),
    email: user.email,
    videoTitle: video.title || '',
    videoSummary: video.summary || '',
    videoId: video.id || video.driveLink || '',
    uid: user.uid || '',
  });
};

export const checkIsAdmin = async (user) => {
  if (!user) return false;
  const snap = await getDoc(doc(db, 'admins', user.email));
  return snap.exists();
};

export const downloadLogsAsCSV = async () => {
  try {
    const snap = await getDocs(collection(db, 'logs'));
    const logs = snap.docs.map(d => d.data());
    logs.sort((a, b) => {
      const aTime = a.viewedAt?.seconds ?? new Date(a.viewedAt).getTime() / 1000;
      const bTime = b.viewedAt?.seconds ?? new Date(b.viewedAt).getTime() / 1000;
      return aTime - bTime;
    });

    const rows = [['日時', 'メールアドレス', '動画タイトル', '動画サマリー', '動画URL']];
    logs.forEach(d => {
      rows.push([
        d.viewedAt?.seconds
          ? new Date(d.viewedAt.seconds * 1000).toLocaleString()
          : (d.viewedAt ? new Date(d.viewedAt).toLocaleString() : ''),
        d.email || '',
        d.videoTitle || '',
        d.videoSummary || '',
        d.videoId || '',
      ]);
    });

    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const fileName = `view_logs_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.csv`;

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('downloadLogsAsCSV error:', e);
    alert('ダウンロード処理でエラーが発生しました: ' + e.message);
  }
};

export const deleteSelectedItems = async (user, target, selectedIds) => {
  if (!user || selectedIds.length === 0) return;
  for (const id of selectedIds) {
    await deleteDoc(doc(db, 'users', user.uid, target, id));
  }
};

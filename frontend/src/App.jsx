import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, provider, db, ALLOWED_DOMAIN, API_URL } from './firebase';
import { fetchMyList, fetchHistory } from './services/firestore';
import { extractDriveId, getDriveThumbnailUrl } from './utils/helpers';

import Header from './components/Header';
import VideoCard from './components/VideoCard';
import VideoModal from './components/VideoModal';
import VideoModalList from './components/VideoModalList';
import LoginScreen from './components/LoginScreen';
import IntroScreen from './components/IntroScreen';

export default function App() {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [showMyList, setShowMyList] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [myList, setMyList] = useState([]);
  const [history, setHistory] = useState([]);
  const [showIntro, setShowIntro] = useState(true);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) setShowIntro(true);
    });
    return () => unsubscribe();
  }, []);

  // 管理者判定（Firestoreの admins コレクションで確認）
  useEffect(() => {
    if (!user) { setIsAdminUser(false); return; }
    getDoc(doc(db, 'admins', user.email)).then(snap => setIsAdminUser(snap.exists()));
  }, [user]);

  // 動画データ取得
  useEffect(() => {
    if (!user) { setVideos([]); return; }
    const fetchVideos = async () => {
      setIsLoading(true);
      setDataError(null);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        setVideos(await response.json());
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setDataError('講義動画の取得に失敗しました。バックエンドサーバーが起動しているか確認してください。');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, [user]);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      if (email && email.endsWith(ALLOWED_DOMAIN)) {
        setUser(result.user);
      } else {
        await signOut(auth);
        setAuthError(`このメールアドレス (${email}) は ${ALLOWED_DOMAIN} ドメインではありません。`);
        setUser(null);
      }
    } catch (error) {
      if (error.code === 'auth/api-key-not-valid') {
        setAuthError('Firebase APIキーが無効です。');
      } else if (error.code === 'auth/unauthorized-domain') {
        setAuthError('ドメイン認証エラー。GCPの承認済みJavaScript生成元にlocalhost:5173が登録されているか確認してください。');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('サインインがキャンセルされました。');
      } else {
        setAuthError('ログイン中に不明なエラーが発生しました。再度お試しください。');
        console.error('Login Error:', error);
      }
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAuthError(null);
      setShowIntro(true);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const handleShowMyList = async () => {
    if (!user) return;
    setMyList(await fetchMyList(user));
    setShowMyList(true);
  };

  const handleShowHistory = async () => {
    if (!user) return;
    setHistory(await fetchHistory(user));
    setShowHistory(true);
  };

  if (isLoading && !user) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">認証データをロード中...</div>;
  }
  if (!user) {
    return <LoginScreen handleLogin={handleLogin} error={authError} />;
  }
  if (showIntro) {
    return <IntroScreen onEnd={() => setShowIntro(false)} />;
  }

  const filteredVideos = selectedCategory === 'すべて'
    ? videos
    : videos.filter(video => (video.category || '') === selectedCategory);

  return (
    <div className="min-h-screen bg-black font-sans antialiased">
      <Toaster />
      <Header
        onCategoryChange={setSelectedCategory}
        user={user}
        handleLogout={handleLogout}
        handleShowMyList={handleShowMyList}
        handleShowHistory={handleShowHistory}
        isAdminUser={isAdminUser}
      />

      <main className="pt-20 md:pt-24 pb-8 px-4 md:px-12">
        {isLoading && <div className="text-center text-white text-lg py-8">動画データをロード中...</div>}

        {dataError && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded mb-6">
            {dataError}
          </div>
        )}

        {filteredVideos.length > 0 && (
          <section
            className="relative h-[50vh] md:h-[60vh] flex items-end p-6 md:p-12 bg-cover bg-center rounded-xl shadow-2xl cursor-pointer"
            style={{
              backgroundImage: `url('${
                filteredVideos[0].thumbnail?.startsWith('http')
                  ? filteredVideos[0].thumbnail
                  : getDriveThumbnailUrl(extractDriveId(filteredVideos[0].driveLink))
              }')`
            }}
            onClick={() => setSelectedVideo(filteredVideos[0])}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent rounded-xl" />
            <div className="relative z-10 max-w-xl text-white">
              <p className="text-lg text-red-600 font-bold mb-2">おすすめ講義</p>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">{filteredVideos[0].title}</h2>
              <p className="text-sm md:text-lg line-clamp-3 mb-6">{filteredVideos[0].summary}</p>
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            全講義動画 ({selectedCategory} {filteredVideos.length}件)
          </h2>
          {filteredVideos.length === 0 && !isLoading ? (
            <p className="text-gray-400 text-lg">動画が見つかりませんでした。</p>
          ) : (
            <div className="grid gap-x-6 gap-y-10 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredVideos.map((video, index) => (
                <VideoCard
                  key={video.driveLink || video.title || index}
                  video={video}
                  onClick={() => setSelectedVideo(video)}
                  user={user}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} user={user} />

      {showMyList && (
        <VideoModalList
          title="マイリスト"
          type="mylist"
          videos={myList}
          onClose={() => setShowMyList(false)}
          user={user}
          setMyList={setMyList}
        />
      )}
      {showHistory && (
        <VideoModalList
          title="視聴履歴"
          type="history"
          videos={history}
          onClose={() => setShowHistory(false)}
          user={user}
          setHistory={setHistory}
        />
      )}
    </div>
  );
}

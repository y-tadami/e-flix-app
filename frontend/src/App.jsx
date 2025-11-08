import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Bell, User, Play, Info, X, LogOut, Heart } from 'lucide-react'; // Heartアイコンを追加
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

// --- Firebase 設定 ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Flask バックエンドの API エンドポイント (データ連携)
const API_URL = import.meta.env.VITE_API_URL;

// -----------------------------------------------------------------
// Firebaseの初期化と定数をコンポーネントの外に移動
// -----------------------------------------------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const ALLOWED_DOMAIN = import.meta.env.VITE_ALLOWED_DOMAIN;
// -----------------------------------------------------------------

const categories = [
  { key: 'すべて', label: 'すべて' },
  { key: 'LLM', label: 'LLM' },
  { key: 'ML', label: 'ML' },
  { key: 'DS', label: 'DS' },
  { key: 'データ基盤', label: 'データ基盤' },
];

// =================================================================
// Google Drive サムネイル生成ロジック
// =================================================================

const extractDriveId = (driveLink) => {
  if (!driveLink) return null;
  const match = driveLink.match(/\/d\/([^/]+)/);
  return match ? match[1] : null;
};

const getDriveThumbnailUrl = (fileId) => {
  if (!fileId) return null;
  // サムネイル用のURLを生成（サイズ指定付き）
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w300`;
};

const thumbnailFor = (video) => {
  if (!video) return null;
  
  // thumbnail列の値を優先
  if (video.thumbnail && !video.thumbnail.includes('placehold.co')) {
    return video.thumbnail;
  }
  
  // driveLinkからサムネイル生成
  const id = extractDriveId(video.driveLink);
  if (id) {
    return getDriveThumbnailUrl(id);
  }
  
  // フォールバック
  return 'https://placehold.co/300x168/20232a/E50914?text=E-FLIX+THUMBNAIL';
};

// =================================================================


/**
 * 動画詳細モーダル (FR-203, FR-204)
 */
const VideoModal = ({ video, onClose, user }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // モーダルが開かれるたびにisPlayingをリセット
  useEffect(() => {
    setIsPlaying(false);
  }, [video]);

  const handlePlay = async () => {
    if (user) {
      await addToHistory(video, user);
    }
    setIsPlaying(true);
  };

  const handleAddToMyList = async () => {
    if (!user) return;
    setIsAdding(true);
    await addToMyList(video, user);
    setIsAdding(false);
    alert('マイリストに追加しました');
  };

  if (!video) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* クローズボタン */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 bg-black/70 p-2 rounded-full text-white hover:bg-black transition z-10"
        >
          <X size={24} />
        </button>

        {/* 動画プレイヤーエリア or 再生ボタン */}
        <div className="relative aspect-video bg-black rounded-t-lg flex items-center justify-center">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="flex flex-col items-center justify-center bg-black/70 rounded-full px-8 py-6 hover:bg-black/90 transition"
            >
              <Play size={48} fill="white" className="mb-2" />
              <span className="text-white text-lg font-bold">再生</span>
            </button>
          ) : (
            <iframe 
              className="w-full h-full"
              src={video.driveLink}
              frameBorder="0" 
              allow="autoplay; fullscreen; picture-in-picture" 
              allowFullScreen
              title={video.title}
            ></iframe>
          )}
        </div>

        {/* 詳細情報エリア */}
        <div className="p-6 md:p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-red-600">{video.title}</h2>
            {/* ハートアイコンボタン */}
            <button
              onClick={handleAddToMyList}
              className={`ml-4 p-2 rounded-full border border-red-600 bg-black/60 hover:bg-red-600 transition-colors duration-200 flex items-center justify-center ${isAdding ? 'opacity-50 pointer-events-none' : ''}`}
              title="マイリストに追加"
            >
              <Heart size={28} className="text-red-600" fill="none" />
            </button>
          </div>
          <div className="flex items-center space-x-3 text-sm mb-4">
            <span className="text-gray-400">カテゴリ: {video.category}</span>
          </div>
          <p className="text-gray-200 leading-relaxed text-sm md:text-base mb-4">{video.summary}</p>
          {video.description && (
            <div className="mt-4">
              <h3 className="text-gray-400 text-sm mb-1">詳細情報</h3>
              <p className="text-white whitespace-pre-wrap">{video.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


/**
 * 動画のサムネイルと詳細情報を含むカード
 */
const VideoCard = ({ video, onClick, user }) => {
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToMyList = async (e) => {
    e.stopPropagation();
    if (!user) return;
    setIsAdding(true);
    await addToMyList(video, user);
    setIsAdding(false);
    alert('マイリストに追加しました');
  };

  // クリックイベントの伝播を止める
  const handleDetailsClick = (e) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => onClick(video)}>
        <div className="w-full aspect-video bg-gray-900 rounded-t-md overflow-hidden">
          <img
            src={
              imageError
                ? 'https://placehold.co/300x168/20232a/E50914?text=NO+IMAGE'
                : thumbnailFor(video)
            }
            alt={video.title || 'サムネイル'}
            className="w-full h-36 object-cover rounded-t-md"
            onError={() => setImageError(true)}
          />
        </div>

        <div className="p-4 bg-gray-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold truncate">{video.title}</h3>
            {/* ハートアイコンボタン */}
            <button
              onClick={handleAddToMyList}
              className={`ml-2 p-2 rounded-full border border-red-600 bg-black/60 hover:bg-red-600 transition-colors duration-200 flex items-center justify-center ${isAdding ? 'opacity-50 pointer-events-none' : ''}`}
              title="マイリストに追加"
            >
              <Heart size={20} className="text-red-600" fill="none" />
            </button>
          </div>
          <p className="text-gray-400 text-sm truncate">{video.summary}</p>
          {/* 詳細情報ボタン */}
          <button
            onClick={e => { e.stopPropagation(); setShowDetails(true); }}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-1 transition-colors duration-200"
          >
            <Info size={16} /> 詳細情報
          </button>
        </div>
        {/* カテゴリーバッジ */}
        {video.category && (
          <span className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs rounded">
            {video.category}
          </span>
        )}
      </div>

      {/* 詳細情報モーダル */}
      {showDetails && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 
                     flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(false);
          }}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full 
                       transform transition-all max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">
                {video.title}
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-400 text-sm">概要</h3>
                <p className="text-white mt-1">{video.summary}</p>
              </div>
              
              {video.description && (
                <div>
                  <h3 className="text-gray-400 text-sm">詳細情報</h3>
                  <p className="text-white mt-1 whitespace-pre-wrap">
                    {video.description}
                  </p>
                </div>
              )}

              {video.category && (
                <div>
                  <h3 className="text-gray-400 text-sm">カテゴリー</h3>
                  <p className="text-white mt-1">{video.category}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};


/**
 * E-FLIX風のヘッダーナビゲーション
 */
const Header = ({ setSearchTerm, onCategoryChange, user, handleLogout, handleShowMyList, handleShowHistory }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("すべて");
  const [isCategoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    onCategoryChange(category);
    setCategoryMenuOpen(false); // カテゴリ選択時に閉じる
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-black/90 p-4 md:px-12 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center space-x-8">
        {/* ロゴ */}
        <h1 className="text-red-600 text-3xl font-bold tracking-widest cursor-pointer hover:text-red-500 transition">
          E-FLIX
        </h1>
        {/* ナビゲーションリンク (PC/タブレット向け) */}
        <nav className="hidden md:flex space-x-6 text-white text-sm font-medium">
          {categories.map(category => (
            <button
              key={category.key}
              onClick={() => handleCategoryClick(category.key)}
              className={`hover:text-gray-300 transition ${currentCategory === category.key ? 'text-white font-bold' : 'text-gray-400'}`}
            >
              {category.label}
            </button>
          ))}
        </nav>
        {/* モバイル向けカテゴリドロップダウン */}
        <div className="relative md:hidden">
          <button
            onClick={() => setCategoryMenuOpen(p => !p)}
            className="flex items-center text-white text-sm hover:text-gray-300 transition"
          >
            {currentCategory} <ChevronDown size={16} className="ml-1 transition-transform" />
          </button>
          {isCategoryMenuOpen && (
             <div className="absolute left-0 mt-2 w-48 bg-black border border-gray-700 rounded shadow-lg z-50">
                {categories.map(category => (
                    <button
                        key={category.key}
                        onClick={() => handleCategoryClick(category.key)}
                        className={`block w-full text-left px-4 py-2 text-sm transition ${currentCategory === category.key ? 'text-red-600 font-bold' : 'text-white hover:bg-gray-800'}`}
                    >
                        {category.label}
                    </button>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* ユーザーアイコンとメニュー */}
        <div className="relative">
          <div 
             className="flex items-center cursor-pointer"
             onClick={() => setUserMenuOpen(p => !p)}
          >
            <User size={28} className="text-white border-2 border-white rounded-full p-1" />
            <ChevronDown size={16} className="text-white ml-1" />
          </div>
          {/* ユーザーメニュー */}
          {isUserMenuOpen && (
             <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-700 rounded shadow-lg z-50">
                <div className="px-4 py-3 border-b border-gray-700 text-white truncate">
                    <p className="text-xs text-gray-400">ログインユーザー</p>
                    <p className="text-sm font-bold">{user?.displayName || user?.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-800 transition"
                >
                    <LogOut size={16} className="mr-2" /> ログアウト
                </button>
                {/* 追加: マイリストと視聴履歴ボタン */}
                <button
                  onClick={handleShowMyList}
                  className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-800 transition"
                >
                  マイリスト
                </button>
                <button
                  onClick={handleShowHistory}
                  className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-800 transition"
                >
                  視聴履歴
                </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


/**
 * ログイン画面コンポーネント
 */
const LoginScreen = ({ handleLogin, error }) => (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-900 p-8 md:p-12 rounded-lg shadow-2xl max-w-sm w-full text-center">
        <h1 className="text-red-600 text-4xl font-bold mb-6">E-FLIX</h1>
        <p className="text-white mb-8">社内講義動画プラットフォーム</p>
        
        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded mb-4 text-sm">
                {error}
            </div>
        )}

        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 3.6c2.427 0 4.382 1.955 4.382 4.382 0 2.427-1.955 4.382-4.382 4.382-2.427 0-4.382-1.955-4.382-4.382 0-2.427 1.955-4.382 4.382-4.382zm0 18.9c-3.14 0-5.918-1.554-7.66-3.954l.024-.047c.725-.92 1.55-1.78 2.44-2.52 1.07-.88 2.21-1.63 3.39-2.19 1.18-.56 2.47-.83 3.8-.83 1.33 0 2.62.27 3.8.83 1.18.56 2.32 1.31 3.39 2.19.89.74 1.715 1.6 2.44 2.52l.024.047c-1.742 2.4-4.52 3.954-7.66 3.954z"/>
          </svg>
          Googleでサインイン
        </button>

        <p className="text-gray-400 text-xs mt-4">
            サインインには {ALLOWED_DOMAIN} ドメインのメールアドレスが必要です。
        </p>
      </div>
    </div>
);


/**
 * イントロ画面コンポーネント
 */
const IntroScreen = ({ onEnd }) => {
  useEffect(() => {
    const audio = new Audio('/intro-dune.mp3');
    audio.play().catch(() => {});
    const timer = setTimeout(onEnd, 2000);
    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
      <span
        className="text-red-600 text-6xl md:text-8xl font-sans font-bold tracking-widest animate-estyle-fade"
        style={{ letterSpacing: '0.15em' }}
      >
        ESTYLE
      </span>
      <style>{`
        .animate-estyle-fade {
          animation: estyleFadeIn 1.4s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes estyleFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
            letter-spacing: 0.4em;
          }
          60% {
            opacity: 1;
            transform: scale(1.05);
            letter-spacing: 0.12em;
          }
          100% {
            opacity: 1;
            transform: scale(1);
            letter-spacing: 0.15em;
          }
        }
      `}</style>
    </div>
  );
};


/**
 * メインアプリケーションコンポーネント
 */
export default function App() {
  // --- Hooksの定義をコンポーネントの最上部に集約 ---
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  
  // データとUIの状態を管理
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [dataError, setDataError] = useState(null); 

  // マイリスト・視聴履歴関連の状態
  const [showMyList, setShowMyList] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [myList, setMyList] = useState([]);
  const [history, setHistory] = useState([]);
  const [showIntro, setShowIntro] = useState(true);

  // --- 認証状態のリスナー設定（常に実行） ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) setShowIntro(true);
    });
    return () => unsubscribe();
  }, []);

  // --- データフェッチロジック (useCallback/useMemoを削除) ---
  const fetchVideos = async () => {
      setIsLoading(true);
      setDataError(null);
      try {
          const response = await fetch(API_URL);
          
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.error) {
              throw new Error(data.error);
          }
          
          setVideos(data);
          setIsLoading(false);

      } catch (error) {
          console.error("Failed to fetch videos:", error);
          setDataError("講義動画の取得に失敗しました。バックエンドサーバーが起動しているか確認してください。");
          setIsLoading(false);
      }
  };


  // --- 認証関数---
  const handleLogin = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      if (email && email.endsWith(ALLOWED_DOMAIN)) {
        setUser(result.user);
        // サウンド再生
        const audio = new Audio('/intro-dune.mp3');
        audio.play().catch(() => {});
      } else {
        await signOut(auth);
        setAuthError(`このメールアドレス (${email}) は ${ALLOWED_DOMAIN} ドメインではありません。`);
        setUser(null);
      }
    } catch (error) {
        // エラーハンドリングは全てここに集約
      if (error.code === 'auth/api-key-not-valid') {
        setAuthError("Firebase APIキーが無効です。App.jsxの設定を確認してください。");
      } else if (error.code === 'auth/unauthorized-domain') {
        setAuthError("ドメイン認証エラー。GCPの承認済み JavaScript 生成元 に localhost:5173 が登録されているか確認してください。");
      } else if (error.code === 'auth/popup-closed-by-user') {
          setAuthError("サインインがキャンセルされました。");
      } else {
          setAuthError("ログイン中に不明なエラーが発生しました。再度お試しください。");
          console.error("Login Error:", error);
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
      console.error("Logout Error:", error);
    }
  };


  // --- データ取得 useEffect（常に実行） ---
  useEffect(() => {
    // ユーザーが認証された場合のみデータをフェッチ
    if (user) {
        fetchVideos();
    }
    // userがnullの場合、動画リストをクリアし、ロードを終了する
    if (!user) {
        setVideos([]);
    }
  }, [user]); // 🚨 依存配列からfetchVideosを削除

  // --- マイリスト・視聴履歴関連の関数 ---
  const handleShowMyList = async () => {
    if (!user) return;
    const list = await fetchMyList(user);
    setMyList(list);
    setShowMyList(true);
  };

  const handleShowHistory = async () => {
    if (!user) return;
    const list = await fetchHistory(user);
    setHistory(list);
    setShowHistory(true);
  };

  // --- UI表示ロジック ---

  if (isLoading && !user) {
    // 認証初期化中のローディング
    return <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">認証データをロード中...</div>;
  }
  
  // ログインが必要な場合
  if (!user) {
    return <LoginScreen handleLogin={handleLogin} error={authError} />;
  }
  
  // イントロ表示
  if (showIntro) {
    return <IntroScreen onEnd={() => setShowIntro(false)} />;
  }
  
  // フィルタリングロジック (FR-202)
  const filteredVideos =
  selectedCategory === 'すべて'
    ? videos
    : videos.filter(video => (video.category || '') === selectedCategory);


  const handleOpenModal = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseModal = () => { 
    setSelectedVideo(null);
  };

  return (
    // Tailwindのダークテーマを適用するためにbg-blackを使用
    <div className="min-h-screen bg-black font-sans antialiased">
      <Header 
        setSearchTerm={setSearchTerm} 
        onCategoryChange={setSelectedCategory}
        user={user}
        handleLogout={handleLogout}
        handleShowMyList={handleShowMyList}
        handleShowHistory={handleShowHistory}
      />

      <main className="pt-20 md:pt-24 pb-8 px-4 md:px-12">
        
        {/* データロード状態表示 */}
        {isLoading && user && (
            <div className="text-center text-white text-lg py-8">動画データをロード中...</div>
        )}

        {/* データエラー表示 */}
        {dataError && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded mb-6">
                {dataError}
            </div>
        )}

        {/* ヒーローエリア (トップの動画) */}
        {filteredVideos.length > 0 && (
          <section
            className="relative h-[50vh] md:h-[60vh] flex items-end p-6 md:p-12 bg-cover bg-center rounded-xl shadow-2xl cursor-pointer"
            style={{
              backgroundImage: `url('${
                filteredVideos[0].thumbnail && filteredVideos[0].thumbnail.startsWith('http')
                  ? filteredVideos[0].thumbnail
                  : getDriveThumbnailUrl(extractDriveId(filteredVideos[0].driveLink), 800)
              }')`
            }}
            onClick={() => handleOpenModal(filteredVideos[0])}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
            <div className="relative z-10 max-w-xl text-white">
              <p className="text-lg text-red-600 font-bold mb-2">おすすめ講義</p>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">{filteredVideos[0].title}</h2>
              <p className="text-sm md:text-lg line-clamp-3 mb-6">{filteredVideos[0].summary}</p>
              {/* 再生・詳細ボタンは削除 */}
            </div>
          </section>
        )}


        {/* 動画リストセクション (FR-201) */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">全講義動画 ({selectedCategory} {filteredVideos.length}件)</h2>
          
          {filteredVideos.length === 0 && !isLoading ? (
            <p className="text-gray-400 text-lg">
              「{searchTerm}」に一致する動画は見つかりませんでした。
            </p>
          ) : (
            <div className="grid gap-x-6 gap-y-10 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredVideos.map((video, index) => (
                <VideoCard
                  key={video.driveLink || video.title || index}
                  video={video}
                  onClick={() => handleOpenModal(video)}
                  user={user}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 動画モーダル */}
      <VideoModal video={selectedVideo} onClose={handleCloseModal} user={user} />
      
      {/* サムネイル設定状況デバッグ用ログ */}
      {videos.length > 0 && (
        <div className="hidden">
          {videos.map(video => {
            const thumb = thumbnailFor(video);
            return (
              <div key={video.id}>
                {video.title}:
                <br />
                - 使用URL: {thumb}
                <br />
              </div>
            );
          })}
        </div>
      )}

      {/* マイリスト・視聴履歴モーダル */}
      {showMyList && (
        <VideoModalList
          title="マイリスト"
          videos={myList}
          onClose={() => setShowMyList(false)}
          user={user}
          setMyList={setMyList}
        />
      )}
      {showHistory && (
        <VideoModalList
          title="視聴履歴"
          videos={history}
          onClose={() => setShowHistory(false)}
          user={user}
          setHistory={setHistory}
        />
      )}

      {/* イントロ画面 */}
      {showIntro && <IntroScreen onEnd={() => setShowIntro(false)} />}
    </div>
  );
}

// video: 動画オブジェクト, user: Firebaseユーザー
const addToMyList = async (video, user) => {
  if (!user) return;
  // ドキュメントIDに/が含まれないようにエンコード
  const docId = video.id || encodeURIComponent(video.driveLink);
  const ref = doc(db, "users", user.uid, "mylist", docId);
  await setDoc(ref, video);
};

const fetchMyList = async (user) => {
  if (!user) return [];
  const ref = collection(db, "users", user.uid, "mylist");
  const snap = await getDocs(ref);
  return snap.docs.map(doc => doc.data());
};

const fetchHistory = async (user) => {
  if (!user) return [];
  const ref = collection(db, "users", user.uid, "history");
  const snap = await getDocs(ref);
  // viewedAtで降順ソート
  return snap.docs
    .map(doc => doc.data())
    .sort((a, b) => (b.viewedAt?.seconds || 0) - (a.viewedAt?.seconds || 0));
};

const addToHistory = async (video, user) => {
  if (!user) return;
  // 一意なIDを決める（idがなければdriveLinkをエンコード）
  const docId = video.id || encodeURIComponent(video.driveLink);
  const ref = doc(db, "users", user.uid, "history", docId);
  await setDoc(ref, {
    ...video,
    viewedAt: new Date()
  });
};

const deleteAllHistory = async (user, onDeleted) => {
  if (!user) return;
  const ref = collection(db, "users", user.uid, "history");
  const snap = await getDocs(ref);
  const batch = [];
  snap.forEach(docSnap => {
    batch.push(deleteDoc(doc(db, "users", user.uid, "history", docSnap.id)));
  });
  await Promise.all(batch);
  if (onDeleted) onDeleted();
};

/**
 * 動画リストモーダル (マイリスト・視聴履歴用)
 */
const VideoModalList = ({ title, videos, onClose, onVideoClick, user, setHistory, setMyList }) => {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // 動画の一意なIDを取得
  const getVideoId = (video) => video.id || encodeURIComponent(video.driveLink);

  // 選択状態の切り替え
  const toggleSelect = (video) => {
    const id = getVideoId(video);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  // 選択削除
  const handleDeleteSelected = async () => {
    if (!user || selectedIds.length === 0) return;
    const target = title === "視聴履歴" ? "history" : "mylist";
    for (const id of selectedIds) {
      await deleteDoc(doc(db, "users", user.uid, target, id));
    }
    // UI更新
    if (title === "視聴履歴" && setHistory) {
      setHistory((prev) => prev.filter((v) => !selectedIds.includes(getVideoId(v))));
    }
    if (title === "マイリスト" && setMyList) {
      setMyList((prev) => prev.filter((v) => !selectedIds.includes(getVideoId(v))));
    }
    setSelectedIds([]);
    setSelectMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-0">
      <div className="bg-black rounded-lg shadow-2xl w-full h-full max-w-none max-h-none overflow-y-auto relative flex flex-col">
        {/* ロゴ・クローズボタン */}
        <div className="flex items-center justify-between px-8 pt-8">
          <h1 className="text-red-600 text-3xl font-bold tracking-widest">E-FLIX</h1>
          <button
            onClick={onClose}
            className="bg-black/70 p-2 rounded-full text-white hover:bg-black transition z-10"
          >
            <X size={24} />
          </button>
        </div>
        {/* タイトル */}
        <div className="flex items-center ml-8 mb-6 mt-4">
          <h2 className="text-2xl font-bold text-white">
            {user?.displayName || user?.email}の{title}
          </h2>
          <button
            onClick={() => setSelectMode((v) => !v)}
            className="ml-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition"
          >
            {selectMode ? "選択解除" : "選択して削除"}
          </button>
          {selectMode && selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="ml-2 px-4 py-1 bg-red-700 hover:bg-red-800 text-white rounded font-bold"
            >
              選択した{title === "視聴履歴" ? "履歴" : "動画"}を削除
            </button>
          )}
        </div>
        {videos.length === 0 ? (
          <p className="text-gray-400 text-lg px-8 pb-8">まだ動画がありません。</p>
        ) : (
          <div className="grid gap-x-6 gap-y-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 px-8 pb-8">
            {videos.map((video, idx) => {
              const id = video.id || encodeURIComponent(video.driveLink);
              return (
                <div
                  key={id}
                  className={`relative cursor-pointer ${selectMode ? 'border-2 border-red-600' : ''}`}
                  onClick={() => selectMode ? toggleSelect(video) : setSelectedVideo(video)}
                >
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(id)}
                      onChange={() => toggleSelect(video)}
                      className="absolute top-2 left-2 w-5 h-5 accent-red-600 z-10"
                      onClick={e => e.stopPropagation()}
                    />
                  )}
                  <div className="w-full aspect-video bg-gray-900 rounded-t-md overflow-hidden">
                    <img
                      src={thumbnailFor(video)}
                      alt={video.title || 'サムネイル'}
                      className="w-full h-36 object-cover rounded-t-md"
                    />
                  </div>
                  <div className="p-3 bg-gray-800 rounded-b-md">
                    <h3 className="text-white font-semibold text-sm truncate">{video.title}</h3>
                    <p className="text-gray-400 text-xs mt-1 truncate">{video.summary}</p>
                    {video.viewedAt && (
                      <p className="text-gray-400 text-xs mt-1">
                        視聴日時: {new Date(video.viewedAt.seconds * 1000).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* 動画視聴モーダル（このモーダルの上に重ねて表示） */}
        {selectedVideo && (
          <VideoModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
            user={user}
          />
        )}
      </div>
    </div>
  );
};
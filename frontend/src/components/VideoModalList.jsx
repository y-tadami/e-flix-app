import React, { useState } from 'react';
import { X } from 'lucide-react';
import { deleteSelectedItems } from '../services/firestore';
import { thumbnailFor, formatExpireDate } from '../utils/helpers';
import VideoModal from './VideoModal';

const VideoModalList = ({ title, type, videos, onClose, user, setHistory, setMyList }) => {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const getVideoId = (video) => video.id || encodeURIComponent(video.driveLink);

  const toggleSelect = (video) => {
    const id = getVideoId(video);
    setSelectedIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const handleDeleteSelected = async () => {
    if (!user || selectedIds.length === 0) return;
    await deleteSelectedItems(user, type, selectedIds);
    if (type === 'history' && setHistory) {
      setHistory(prev => prev.filter(v => !selectedIds.includes(getVideoId(v))));
    }
    if (type === 'mylist' && setMyList) {
      setMyList(prev => prev.filter(v => !selectedIds.includes(getVideoId(v))));
    }
    setSelectedIds([]);
    setSelectMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-0">
      <div className="bg-black rounded-lg shadow-2xl w-full h-full overflow-y-auto relative flex flex-col">
        <div className="flex items-center justify-between px-8 pt-8">
          <h1 className="text-red-600 text-3xl font-bold tracking-widest">E-FLIX</h1>
          <button onClick={onClose} className="bg-black/70 p-2 rounded-full text-white hover:bg-black transition z-10">
            <X size={24} />
          </button>
        </div>

        <div className="flex items-center ml-8 mb-6 mt-4">
          <h2 className="text-2xl font-bold text-white">
            {user?.displayName || user?.email}の{title}
          </h2>
          <button
            onClick={() => setSelectMode(v => !v)}
            className="ml-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition"
          >
            {selectMode ? '選択解除' : '選択して削除'}
          </button>
          {selectMode && selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="ml-2 px-4 py-1 bg-red-700 hover:bg-red-800 text-white rounded font-bold"
            >
              選択した{type === 'history' ? '履歴' : '動画'}を削除
            </button>
          )}
        </div>

        {videos.length === 0 ? (
          <p className="text-gray-400 text-lg px-8 pb-8">まだ動画がありません。</p>
        ) : (
          <div className="grid gap-x-6 gap-y-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 px-8 pb-8">
            {videos.map(video => {
              const id = getVideoId(video);
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
                    <p className="text-gray-400 text-xs mt-1">
                      視聴期限: {formatExpireDate(video.expireDate)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedVideo && (
          <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} user={user} />
        )}
      </div>
    </div>
  );
};

export default VideoModalList;

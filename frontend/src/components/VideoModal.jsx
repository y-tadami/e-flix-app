import React, { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';
import { addToHistory, addViewLog } from '../services/firestore';
import { formatExpireDate } from '../utils/helpers';

const VideoModal = ({ video, onClose, user }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
  }, [video]);

  const handlePlay = async () => {
    if (user) {
      await addToHistory(video, user);
      await addViewLog(user, video);
    }
    setIsPlaying(true);
  };

  if (!video) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/70 p-2 rounded-full text-white hover:bg-black transition z-10"
        >
          <X size={24} />
        </button>

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
            />
          )}
        </div>

        <div className="p-6 md:p-8 text-white">
          <h2 className="text-3xl font-bold text-red-600 mb-4">{video.title}</h2>
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
          <p className="text-gray-400 text-xs mt-1">
            視聴期限: {formatExpireDate(video.expireDate)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;

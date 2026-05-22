import React, { useState } from 'react';
import { Info, Heart, X } from 'lucide-react';
import { addToMyList } from '../services/firestore';
import { thumbnailFor, formatExpireDate } from '../utils/helpers';
import toast from 'react-hot-toast';

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
    toast('マイリストに追加しました');
  };

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => onClick(video)}>
        <div className="w-full aspect-video bg-gray-900 rounded-t-md overflow-hidden">
          <img
            src={imageError ? 'https://placehold.co/300x168/20232a/E50914?text=NO+IMAGE' : thumbnailFor(video)}
            alt={video.title || 'サムネイル'}
            className="w-full h-36 object-cover rounded-t-md"
            onError={() => setImageError(true)}
          />
        </div>

        <div className="p-4 bg-gray-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold truncate">{video.title}</h3>
            <button
              onClick={handleAddToMyList}
              className={`ml-2 p-2 rounded-full border border-red-600 bg-black/60 hover:bg-red-600 transition-colors duration-200 flex items-center justify-center ${isAdding ? 'opacity-50 pointer-events-none' : ''}`}
              title="マイリストに追加"
            >
              <Heart size={20} className="text-red-600" fill="none" />
            </button>
          </div>
          <p className="text-gray-400 text-sm truncate">{video.summary}</p>
          <p className="text-gray-400 text-xs mt-1">
            視聴期限: {formatExpireDate(video.expireDate)}
          </p>
          <button
            onClick={e => { e.stopPropagation(); setShowDetails(true); }}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-1 transition-colors duration-200"
          >
            <Info size={16} /> 詳細情報
          </button>
        </div>

        {video.category && (
          <span className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs rounded">
            {video.category}
          </span>
        )}
      </div>

      {showDetails && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full transform transition-all max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">{video.title}</h2>
              <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
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
                  <p className="text-white mt-1 whitespace-pre-wrap">{video.description}</p>
                </div>
              )}
              {video.category && (
                <div>
                  <h3 className="text-gray-400 text-sm">カテゴリー</h3>
                  <p className="text-white mt-1">{video.category}</p>
                </div>
              )}
              <div>
                <h3 className="text-gray-400 text-sm">視聴期限</h3>
                <p className="text-white mt-1">{formatExpireDate(video.expireDate)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoCard;

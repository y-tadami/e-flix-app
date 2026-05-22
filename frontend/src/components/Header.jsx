import React, { useState } from 'react';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { downloadLogsAsCSV } from '../services/firestore';

const categories = [
  { key: 'すべて', label: 'すべて' },
  { key: 'LLM',    label: 'LLM' },
  { key: 'ML',     label: 'ML' },
  { key: 'DS',     label: 'DS' },
  { key: 'データ基盤', label: 'データ基盤' },
  { key: '開発',   label: '開発' },
  { key: 'その他', label: 'その他' },
];

const Header = ({ onCategoryChange, user, handleLogout, handleShowMyList, handleShowHistory, isAdminUser }) => {
  const [currentCategory, setCurrentCategory] = useState('すべて');
  const [isCategoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);

  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    onCategoryChange(category);
    setCategoryMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-black/90 p-4 md:px-12 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center space-x-8">
        <h1 className="text-red-600 text-3xl font-bold tracking-widest cursor-pointer hover:text-red-500 transition">
          E-FLIX
        </h1>

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

        <div className="relative md:hidden">
          <button
            onClick={() => setCategoryMenuOpen(p => !p)}
            className="flex items-center text-white text-sm hover:text-gray-300 transition"
          >
            {currentCategory} <ChevronDown size={16} className="ml-1" />
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
        <div className="relative">
          <div className="flex items-center cursor-pointer" onClick={() => setUserMenuOpen(p => !p)}>
            <User size={28} className="text-white border-2 border-white rounded-full p-1" />
            <ChevronDown size={16} className="text-white ml-1" />
          </div>

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
              {isAdminUser && (
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); downloadLogsAsCSV(); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-800 transition"
                >
                  閲覧ログをダウンロード
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

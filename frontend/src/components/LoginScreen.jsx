import React from 'react';
import { ALLOWED_DOMAIN } from '../firebase';

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
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 3.6c2.427 0 4.382 1.955 4.382 4.382 0 2.427-1.955 4.382-4.382 4.382-2.427 0-4.382-1.955-4.382-4.382 0-2.427 1.955-4.382 4.382-4.382zm0 18.9c-3.14 0-5.918-1.554-7.66-3.954l.024-.047c.725-.92 1.55-1.78 2.44-2.52 1.07-.88 2.21-1.63 3.39-2.19 1.18-.56 2.47-.83 3.8-.83 1.33 0 2.62.27 3.8.83 1.18.56 2.32 1.31 3.39 2.19.89.74 1.715 1.6 2.44 2.52l.024.047c-1.742 2.4-4.52 3.954-7.66 3.954z" />
        </svg>
        Googleでサインイン
      </button>

      <p className="text-gray-400 text-xs mt-4">
        サインインには {ALLOWED_DOMAIN} ドメインのメールアドレスが必要です。
      </p>
    </div>
  </div>
);

export default LoginScreen;

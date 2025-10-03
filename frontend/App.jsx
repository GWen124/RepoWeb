import React, { useState } from 'react';

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = () => {
    window.location.href = '/api/github/login';
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>GitHub OAuth 登录演示</h1>
      {!user ? (
        <button onClick={handleLogin}>使用 GitHub 登录</button>
      ) : (
        <div>
          <p>欢迎，{user.name}</p>
          {/* 这里可以添加仓库文件操作 UI */}
        </div>
      )}
    </div>
  );
}

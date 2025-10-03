import React, { useState } from 'react';

export default function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [repo, setRepo] = useState('');
  const [path, setPath] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [sha, setSha] = useState('');
  const [result, setResult] = useState('');

  // 登录流程
  const handleLogin = () => {
    window.location.href = '/api/github/login';
  };

  // 检查 URL 是否带有 access_token
  React.useEffect(() => {
    const search = window.location.search;
    if (search.includes('access_token')) {
      try {
        const params = new URLSearchParams(search);
        const token = params.get('access_token');
        setAccessToken(token);
        // 获取用户信息
        fetch(`/api/github/callback${search}`)
          .then(res => res.json())
          .then(data => {
            setUser(data.user);
            setAccessToken(data.access_token);
          });
      } catch {}
    }
  }, []);

  // 上传/编辑文件
  const handleUpload = async () => {
    if (!accessToken || !repo || !path || !content) {
      setResult('请填写所有必填项');
      return;
    }
    const res = await fetch(`/api/github/file?access_token=${accessToken}&repo=${repo}&path=${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, message }),
    });
    setResult(await res.text());
  };

  // 删除文件
  const handleDelete = async () => {
    if (!accessToken || !repo || !path || !sha) {
      setResult('请填写所有必填项');
      return;
    }
    const res = await fetch(`/api/github/file?access_token=${accessToken}&repo=${repo}&path=${path}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sha, message }),
    });
    setResult(await res.text());
  };

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      <h1>GitHub 仓库文件操作</h1>
      {!user ? (
        <button onClick={handleLogin}>使用 GitHub 登录</button>
      ) : (
        <div>
          <div style={{ marginBottom: 16 }}>
            <img src={user.avatar_url} alt="avatar" style={{ width: 48, borderRadius: 24 }} />
            <span style={{ marginLeft: 8 }}>欢迎，{user.name || user.login}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>仓库名（如 GWen124/RepoWeb）：<br />
              <input value={repo} onChange={e => setRepo(e.target.value)} style={{ width: '100%' }} />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>文件路径（如 README.md）：<br />
              <input value={path} onChange={e => setPath(e.target.value)} style={{ width: '100%' }} />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>内容（上传/编辑时填写）：<br />
              <textarea value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%' }} rows={4} />
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>提交说明（可选）：<br />
              <input value={message} onChange={e => setMessage(e.target.value)} style={{ width: '100%' }} />
            </label>
          </div>
          <button onClick={handleUpload} style={{ marginRight: 16 }}>上传/编辑文件</button>
          <div style={{ margin: '16px 0' }}>
            <label>sha（删除文件时填写）：<br />
              <input value={sha} onChange={e => setSha(e.target.value)} style={{ width: '100%' }} />
            </label>
          </div>
          <button onClick={handleDelete} style={{ background: '#e55', color: '#fff' }}>删除文件</button>
          <div style={{ marginTop: 24, whiteSpace: 'pre-wrap', color: '#333', background: '#f7f7f7', padding: 12, borderRadius: 4 }}>
            <b>操作结果：</b>
            <div>{result}</div>
          </div>
        </div>
      )}
    </div>
  );
}

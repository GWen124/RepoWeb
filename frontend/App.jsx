
import React, { useState } from 'react';

const styles = {
  container: {
    padding: 32,
    maxWidth: 800,
    margin: '0 auto',
    fontFamily: 'system-ui, sans-serif',
    background: '#f4f8fb',
    borderRadius: 12,
    boxShadow: '0 2px 12px #0001',
  },
  card: {
    background: '#fff',
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
    boxShadow: '0 1px 6px #0001',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 4,
    border: '1px solid #ccc',
    marginTop: 4,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    padding: '8px 24px',
    borderRadius: 4,
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    marginRight: 12,
    marginTop: 8,
  },
  danger: {
    background: '#e55',
    color: '#fff',
  },
  fileList: {
    background: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    boxShadow: '0 1px 6px #0001',
    maxHeight: 240,
    overflowY: 'auto',
  },
  fileItem: {
    padding: '6px 0',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [repo, setRepo] = useState('');
  const [path, setPath] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [sha, setSha] = useState('');
  const [result, setResult] = useState('');
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [tree, setTree] = useState([]);
  const [previewContent, setPreviewContent] = useState('');
  const [previewPath, setPreviewPath] = useState('');
  const [expanded, setExpanded] = useState({});

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

  // 获取仓库目录树（递归）
  const fetchTree = async (path = '') => {
    if (!accessToken || !repo) return;
    setLoadingFiles(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?access_token=${accessToken}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        if (!path) setTree(data);
        return data;
      }
      return [];
    } catch {
      return [];
    } finally {
      setLoadingFiles(false);
    }
  };

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
    fetchFiles();
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
    fetchFiles();
  };

  // 目录树渲染
  const renderTree = (nodes, parentPath = '') => (
    <div style={{ marginLeft: 12 }}>
      {nodes.map(node => {
        if (node.type === 'dir') {
          const isOpen = expanded[node.path];
          return (
            <div key={node.path}>
              <span style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 600 }} onClick={async () => {
                setExpanded(exp => ({ ...exp, [node.path]: !exp[node.path] }));
                if (!expanded[node.path]) {
                  const children = await fetchTree(node.path);
                  setTree(tree => tree.map(t => t.path === node.path ? { ...t, children } : t));
                }
              }}>
                {isOpen ? '📂' : '📁'} {node.name}
              </span>
              {isOpen && node.children && renderTree(node.children, node.path)}
            </div>
          );
        }
        // 文件
        return (
          <div key={node.path} style={{ ...styles.fileItem, color: '#333' }} onClick={() => handlePreview(node)}>
            <span role="img" aria-label="file">📄</span>
            <span>{node.name}</span>
            <span style={{ color: '#888', fontSize: 12 }}>{node.sha ? node.sha.slice(0, 7) : ''}</span>
          </div>
        );
      })}
    </div>
  );

  // 预览文件内容
  const handlePreview = async file => {
    setPreviewPath(file.path);
    setPath(file.path);
    setSha(file.sha || '');
    setMessage('');
    setContent('');
    setResult('');
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/contents/${file.path}?access_token=${accessToken}`);
      const data = await res.json();
      if (data && data.content) {
        setPreviewContent(decodeURIComponent(escape(window.atob(data.content))));
        setContent(decodeURIComponent(escape(window.atob(data.content))));
      } else {
        setPreviewContent('无法获取内容');
      }
    } catch {
      setPreviewContent('获取内容失败');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: 'center', color: '#2563eb', marginBottom: 32 }}>GitHub 仓库文件操作</h1>
      {!user ? (
        <div style={styles.card}>
          <button style={styles.button} onClick={handleLogin}>使用 GitHub 登录</button>
        </div>
      ) : (
        <div>
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <img src={user.avatar_url} alt="avatar" style={{ width: 48, borderRadius: 24, marginRight: 12 }} />
              <span style={{ fontSize: 18 }}>欢迎，{user.name || user.login}</span>
            </div>
            <label>仓库名（如 GWen124/RepoWeb）：<br />
              <input style={styles.input} value={repo} onChange={e => setRepo(e.target.value)} />
            </label>
            <button style={styles.button} onClick={() => fetchTree() } disabled={!repo || !accessToken || loadingFiles}>
              {loadingFiles ? '加载中...' : '获取目录树'}
            </button>
          </div>
          {tree.length > 0 && (
            <div style={styles.fileList}>
              <b>仓库目录树：</b>
              {renderTree(tree)}
            </div>
          )}
          <div style={styles.card}>
            <label>文件路径（如 README.md）：<br />
              <input style={styles.input} value={path} onChange={e => setPath(e.target.value)} />
            </label>
            <label>内容（上传/编辑时填写）：<br />
              <textarea style={styles.input} value={content} onChange={e => setContent(e.target.value)} rows={4} />
            </label>
            <label>提交说明（可选）：<br />
              <input style={styles.input} value={message} onChange={e => setMessage(e.target.value)} />
            </label>
            <button style={styles.button} onClick={handleUpload}>上传/编辑文件</button>
            <label>sha（删除文件时填写）：<br />
              <input style={styles.input} value={sha} onChange={e => setSha(e.target.value)} />
            </label>
            <button style={{ ...styles.button, ...styles.danger }} onClick={handleDelete}>删除文件</button>
            <div style={{ marginTop: 24, whiteSpace: 'pre-wrap', color: '#333', background: '#f7f7f7', padding: 12, borderRadius: 4 }}>
              <b>操作结果：</b>
              <div>{result}</div>
            </div>
            {previewPath && (
              <div style={{ marginTop: 24, background: '#eef', padding: 12, borderRadius: 4 }}>
                <b>文件内容预览：</b>
                <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: '#222', marginTop: 8 }}>
                  <span style={{ color: '#2563eb' }}>{previewPath}</span>
                  <br />
                  {previewContent}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

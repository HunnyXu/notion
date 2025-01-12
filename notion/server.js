const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用 CORS
app.use(cors());

// 设置静态文件目录
app.use(express.static(path.join(__dirname)));

// API 路由
app.get('/api/data', (req, res) => {
  res.json({
    message: 'Hello from Notion Widget Server!',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

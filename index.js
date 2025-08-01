import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

// 환경변수 로드
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB 연결 (Atlas 또는 로컬)
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mogagso_web';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB 연결 성공');
    console.log('📍 연결된 데이터베이스:', mongoose.connection.host);
  } catch (error) {
    console.log('❌ MongoDB 연결 실패:', error.message);
    console.log('💡 MongoDB Atlas 설정 방법:');
    console.log('1. https://www.mongodb.com/atlas 에서 계정 생성');
    console.log('2. 무료 클러스터 생성');
    console.log('3. Database Access에서 사용자 생성');
    console.log('4. Network Access에서 IP 허용');
    console.log('5. .env 파일에 MONGODB_URI 설정');
  }
};

// MongoDB 연결 시도
connectDB();

// 라우트 설정
app.use('/api/auth', authRoutes);

// 관리자 페이지 라우트
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Mogagso Web API 서버',
    status: mongoose.connection.readyState === 1 ? 'MongoDB 연결됨' : 'MongoDB 연결 안됨',
    database: mongoose.connection.readyState === 1 ? mongoose.connection.host : '연결 안됨',
    endpoints: {
      register: 'POST /api/auth/register',
      users: 'GET /api/auth/users',
      admin: 'GET /admin'
    }
  });
});

// 기존 user 라우트
app.get('/user', (req, res) => {
  const q = req.query;
  res.json({
    'userid': q.id,
    'name': q.name,
    'age': q.age
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

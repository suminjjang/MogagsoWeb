import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

// 환경변수 로드
dotenv.config();

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결 (선택적)
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mogagso_web');
    console.log('✅ MongoDB 연결 성공');
  } catch (error) {
    console.log('❌ MongoDB 연결 실패:', error.message);
    console.log('💡 MongoDB가 설치되어 있지 않거나 실행되지 않고 있습니다.');
    console.log('💡 MongoDB를 설치하거나 MongoDB Atlas를 사용하세요.');
  }
};

// MongoDB 연결 시도
connectDB();

// 라우트 설정
app.use('/api/auth', authRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Mogagso Web API 서버',
    status: mongoose.connection.readyState === 1 ? 'MongoDB 연결됨' : 'MongoDB 연결 안됨',
    endpoints: {
      register: 'POST /api/auth/register',
      users: 'GET /api/auth/users'
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

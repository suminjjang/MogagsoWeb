import express from 'express';
import User from '../models/User.js';
import mongoose from 'mongoose';

const router = express.Router();

// MongoDB 연결 상태 확인 함수
const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: '데이터베이스에 연결할 수 없습니다. MongoDB가 실행 중인지 확인해주세요.'
    });
  }
  next();
};

// 회원가입 API
router.post('/register', checkDBConnection, async (req, res) => {
  try {
    const { userId, phoneNumber, email, password } = req.body;

    // 필수 필드 검증
    if (!userId || !phoneNumber || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '모든 필드를 입력해주세요.'
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '올바른 이메일 형식을 입력해주세요.'
      });
    }

    // 전화번호 형식 검증 (한국 전화번호)
    const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)'
      });
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 최소 6자 이상이어야 합니다.'
      });
    }

    // 중복 검사
    const existingUser = await User.findOne({
      $or: [
        { userId: userId },
        { email: email },
        { phoneNumber: phoneNumber }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 사용자 정보입니다.'
      });
    }

    // 새 사용자 생성
    const newUser = new User({
      userId,
      phoneNumber,
      email,
      password
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: {
        userId: newUser.userId,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber
      }
    });

  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 사용자 목록 조회 API (개발용)
router.get('/users', checkDBConnection, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

export default router;

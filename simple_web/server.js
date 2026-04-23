/**
 * 설치 명령어: npm install express multer axios cors
 * 실행 명령어: node server.js
 */

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const PORT = 3000;

// CORS 설정 및 JSON 파싱 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 이미지 업로드를 위한 Multer 설정 (메모리에 임시 저장)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * FastAPI 서버로 데이터를 전달하는 프록시 엔드포인트
 */
app.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        // 1. 프론트엔드로부터 받은 데이터 추출
        const { question } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "이미지 파일이 없습니다." });
        }

        // 2. FastAPI로 전달할 FormData 구성
        const formData = new FormData();
        formData.append('image', imageFile.buffer, {
            filename: imageFile.originalname,
            contentType: imageFile.mimetype,
        });
        formData.append('question', question || "");

        // 3. FastAPI 서버(localhost:8000)로 분석 요청 전송
        const response = await axios.post('http://localhost:8000/analyze', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        // 4. FastAPI의 결과를 프론트엔드로 반환
        res.json(response.data);

    } catch (error) {
        console.error("FastAPI 연동 에러:", error.message);
        res.status(500).json({
            success: false,
            message: "AI 분석 서버와 통신 중 에러가 발생했습니다."
        });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 시작되었습니다: http://localhost:${PORT}`);
});

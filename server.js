const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(__dirname));

// 서비스 키
const SERVICE_KEY = 'lAzkbZlLWKsZ2GgyhsEFwFqx74rCf5nxO0L6HQAnXzbUACUOrrVdQ/3FTVOQK2yjPJCfOcp6yh2PH1Pish93jA==';

// API 기본 URL 설정
const FESTIVAL_BASE_URL = 'http://api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api';
const PET_BASE_URL = 'https://apis.data.go.kr/B551011/KorPetTourService/areaBasedList';

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/festival', async (req, res) => {
    try {
        // 날짜 파라미터 없이 기본 데이터 요청
        const response = await axios.get(FESTIVAL_BASE_URL, {
            params: {
                serviceKey: SERVICE_KEY,
                pageNo: 1,
                numOfRows: 300,  
                type: 'json'
            }
        });

        console.log('API 응답 코드:', response.data?.response?.header?.resultCode);

        const items = response.data?.response?.body?.items;
        if (!items || items.length === 0) {
            console.log('데이터가 없습니다.');
            return res.json({
                success: true,
                data: {
                    spring: [],
                    summer: [],
                    autumn: [],
                    winter: []
                }
            });
        }

        const festivalArray = Array.isArray(items) ? items : [items];
        
        const seasonalData = {
            spring: [],
            summer: [],
            autumn: [],
            winter: []
        };

        const currentDate = new Date();
        
        festivalArray.forEach(festival => {
            if (!festival.fstvlStartDate) return;
            
            const startDate = new Date(festival.fstvlStartDate);
            // 현재 연도의 축제만 필터링
            if (startDate.getFullYear() === currentDate.getFullYear()) {
                const month = startDate.getMonth() + 1;

                if (month >= 3 && month <= 5) {
                    seasonalData.spring.push({...festival, season: 'spring'});
                } else if (month >= 6 && month <= 8) {
                    seasonalData.summer.push({...festival, season: 'summer'});
                } else if (month >= 9 && month <= 11) {
                    seasonalData.autumn.push({...festival, season: 'autumn'});
                } else {
                    seasonalData.winter.push({...festival, season: 'winter'});
                }
            }
        });

        console.log('계절별 축제 수:', {
            봄: seasonalData.spring.length,
            여름: seasonalData.summer.length,
            가을: seasonalData.autumn.length,
            겨울: seasonalData.winter.length
        });

        res.json({
            success: true,
            data: seasonalData
        });

    } catch (error) {
        console.error('Festival API Error:', error);
        console.error('에러 상세 정보:', error.response?.data);
        res.status(500).json({ 
            success: false,
            error: error.message,
            details: error.response?.data
        });
    }
});

app.get('/api/pet', async (req, res) => {
    try {
        console.log('반려동물 API 요청 시작');
        
        const response = await axios.get(PET_BASE_URL, {
            params: {
                serviceKey: SERVICE_KEY,
                numOfRows: 100,
                pageNo: 1,
                MobileOS: 'ETC',
                MobileApp: 'AppTest',
                _type: 'json'
            }
        });

        console.log('반려동물 API 응답:', JSON.stringify(response.data, null, 2));
        
        if (!response.data?.response?.body?.items?.item) {
            console.log('반려동물 데이터가 없습니다.');
            return res.json({ 
                success: false,
                message: '데이터가 없습니다.' 
            });
        }

        res.json({
            success: true,
            data: response.data.response.body.items.item
        });
    } catch (error) {
        console.error('Pet API Error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            details: error.response?.data
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`서버 URL: http://localhost:${PORT}`);
});
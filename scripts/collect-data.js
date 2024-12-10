const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function collectData() {
    // festival-map/data 디렉토리 경로 설정
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    try {
        // 축제 데이터 수집
        const festivalResponse = await axios.get('http://localhost:3000/api/festival');
        fs.writeFileSync(
            path.join(dataDir, 'festival.json'),
            JSON.stringify(festivalResponse.data, null, 2)
        );

        // 반려동물 데이터 수집
        const petResponse = await axios.get('http://localhost:3000/api/pet');
        fs.writeFileSync(
            path.join(dataDir, 'pet.json'),
            JSON.stringify(petResponse.data, null, 2)
        );

        console.log('데이터 수집 완료');
    } catch (error) {
        console.error('데이터 수집 실패:', error);
    }
}

collectData(); 
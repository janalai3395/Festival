const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');
const path = require('path');
const app = express();

app.use(cors());

app.use(express.static(__dirname));

const parseXML = async (xml) => {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const FESTIVAL_SERVICE_KEY = 'lAzkbZlLWKsZ2GgyhsEFwFqx74rCf5nxO0L6HQAnXzbUACUOrrVdQ%2F3FTVOQK2yjPJCfOcp6yh2PH1Pish93jA%3D%3D';
const PET_SERVICE_KEY = 'lAzkbZlLWKsZ2GgyhsEFwFqx74rCf5nxO0L6HQAnXzbUACUOrrVdQ%2F3FTVOQK2yjPJCfOcp6yh2PH1Pish93jA%3D%3D';

app.get('/api/festival', async (req, res) => {
    try {
        const { eventStartDate, eventEndDate } = req.query;
        console.log('조회 기간:', eventStartDate, eventEndDate);

        const response = await axios.get('http://api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api', {
            params: {
                serviceKey: FESTIVAL_SERVICE_KEY,
                pageNo: 1,
                numOfRows: 100,
                type: 'xml',
                fstvlStartDate: eventStartDate,
                fstvlEndDate: eventEndDate
            },
            responseType: 'text'
        });

        const jsonResult = await parseXML(response.data);
        res.json(jsonResult);
    } catch (error) {
        console.error('Festival API Error:', error);
        res.status(500).json({ 
            error: error.message,
            details: error.response?.data
        });
    }
});

app.get('/api/pet', async (req, res) => {
    try {
        const response = await axios.get('http://apis.data.go.kr/B551011/KorPetTourService/areaBasedList', {
            params: {
                serviceKey: PET_SERVICE_KEY,
                numOfRows: 100,
                pageNo: 1,
                MobileOS: 'ETC',
                MobileApp: 'AppTest',
                _type: 'xml'
            },
            responseType: 'text'
        });

        const jsonResult = await parseXML(response.data);
        res.json(jsonResult);
    } catch (error) {
        console.error('Pet API Error:', error);
        res.status(500).json({ 
            error: error.message,
            details: error.response?.data
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
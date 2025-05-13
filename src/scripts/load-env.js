// 환경 변수를 로드하는 스크립트
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// .env 파일 로드
function loadEnv() {
  // 프로젝트 루트 디렉토리
  const rootDir = path.resolve(__dirname, '../../');
  
  // 다양한 환경 파일들
  const envFiles = [
    '.env.local',
    '.env.development.local',
    '.env.development',
    '.env'
  ];
  
  // 각 파일을 확인하고 존재하면 로드
  for (const file of envFiles) {
    const filePath = path.join(rootDir, file);
    
    if (fs.existsSync(filePath)) {
      console.log(`Loading environment variables from ${file}`);
      dotenv.config({ path: filePath });
    }
  }
  
  // Firebase 개발 환경 설정
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
}

// 환경 변수 로드 실행
loadEnv(); 
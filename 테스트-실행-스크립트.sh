#!/bin/bash

# BAESH Career 백엔드 테스트 실행 스크립트

echo "🚀 BAESH Career 백엔드 테스트 환경 설정"
echo ""

# 1. 백엔드 디렉토리로 이동
cd "$(dirname "$0")/baesh-career-backend" || exit

# 2. .env 파일 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 없습니다. 생성 중..."
    cat > .env << 'EOF'
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database (SQLite 사용 - 개발용)
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=baesh-career-secret-key-change-in-production-2024
JWT_EXPIRES_IN=7d

# OpenAI / Upstage
UPSTAGE_API_KEY=up_TFwA4lkj0aVJx9QPLm6RIbc6t8MvT
UPSTAGE_BASE_URL=https://api.upstage.ai/v1
EOF
    echo "✅ .env 파일 생성 완료"
fi

# 3. 의존성 확인
if [ ! -d node_modules ]; then
    echo "📦 의존성 설치 중..."
    npm install
fi

# 4. Prisma 클라이언트 생성
echo "🔧 Prisma 클라이언트 생성 중..."
npm run prisma:generate

# 5. 데이터베이스 마이그레이션
if [ ! -f prisma/dev.db ]; then
    echo "🗄️  데이터베이스 마이그레이션 중..."
    npm run prisma:migrate -- --name init
fi

# 6. 서버 실행
echo ""
echo "✅ 설정 완료!"
echo ""
echo "백엔드 서버를 시작합니다..."
echo "서버 주소: http://localhost:3001"
echo ""
echo "다른 터미널에서 프론트엔드를 실행하세요:"
echo "  cd ../baesh-career && npm run dev"
echo ""
echo "종료하려면 Ctrl+C를 누르세요"
echo ""

npm run dev


# BAESH Career Backend 설정 가이드

## 1. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database (SQLite 사용 - 개발용)
DATABASE_URL="file:./dev.db"

# 또는 PostgreSQL 사용 시:
# DATABASE_URL="postgresql://user:password@localhost:5432/baesh_career?schema=public"

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# OpenAI / Upstage
UPSTAGE_API_KEY=your-upstage-api-key
UPSTAGE_BASE_URL=https://api.upstage.ai/v1
```

## 2. 의존성 설치

```bash
cd baesh-career-backend
npm install
```

## 3. Prisma 설정

```bash
# Prisma 클라이언트 생성
npm run prisma:generate

# 데이터베이스 마이그레이션 (SQLite 사용 시)
npm run prisma:migrate

# 또는 PostgreSQL 사용 시:
# npm run prisma:migrate dev
```

## 4. 서버 실행

### 개발 모드
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm run build
npm start
```

## 5. API 엔드포인트

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/forgot-password` - 비밀번호 찾기
- `POST /api/auth/reset-password` - 비밀번호 재설정

### 사용자
- `GET /api/users/profile` - 프로필 조회
- `PUT /api/users/profile` - 프로필 수정

### 세션
- `GET /api/sessions` - 모든 세션 조회
- `GET /api/sessions/:id` - 특정 세션 조회
- `POST /api/sessions` - 새 세션 생성
- `PUT /api/sessions/:id` - 세션 업데이트
- `DELETE /api/sessions/:id` - 세션 삭제

### AI
- `POST /api/ai/chat` - 일반 채팅
- `POST /api/ai/chat/stream` - 스트리밍 채팅

## 6. 프론트엔드 연동

프론트엔드의 `.env` 파일에 다음을 추가:

```env
VITE_API_URL=http://localhost:3001/api
```

## 7. 데이터베이스 확인

Prisma Studio로 데이터베이스 확인:

```bash
npm run prisma:studio
```

브라우저에서 `http://localhost:5555` 접속


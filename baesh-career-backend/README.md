# BAESH Career Backend API

BAESH Career Platform의 백엔드 API 서버입니다.

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: JWT
- **AI**: Upstage Solar Pro2

## 시작하기

### 1. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 필요한 값들을 설정하세요:

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=postgresql://user:password@localhost:5432/baesh_career
UPSTAGE_API_KEY=your-upstage-api-key
FRONTEND_URL=http://localhost:5173
```

### 2. 데이터베이스 설정

PostgreSQL이 설치되어 있어야 합니다. 그 다음:

```bash
# Prisma 클라이언트 생성
npm run prisma:generate

# 마이그레이션 실행
npm run prisma:migrate
```

### 3. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

## API 엔드포인트

### 인증 (Auth)

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/forgot-password` - 비밀번호 찾기
- `POST /api/auth/reset-password` - 비밀번호 재설정

### 사용자 (Users)

- `GET /api/users/profile` - 프로필 조회
- `PUT /api/users/profile` - 프로필 업데이트

### 세션 (Sessions)

- `GET /api/sessions` - 세션 목록
- `GET /api/sessions/:id` - 세션 조회
- `POST /api/sessions` - 세션 생성
- `PUT /api/sessions/:id` - 세션 업데이트
- `DELETE /api/sessions/:id` - 세션 삭제

### AI (AI)

- `POST /api/ai/chat` - AI 채팅 (일반)
- `POST /api/ai/chat/stream` - AI 채팅 (스트리밍)

## 프로젝트 구조

```
src/
├── controllers/    # 컨트롤러 (비즈니스 로직)
├── routes/         # 라우트 정의
├── middleware/      # 미들웨어 (인증, 에러 처리 등)
├── services/       # 서비스 레이어
├── utils/          # 유틸리티 함수
└── index.ts        # 진입점
```

## 개발 스크립트

- `npm run dev` - 개발 서버 실행 (nodemon)
- `npm run build` - TypeScript 컴파일
- `npm start` - 프로덕션 서버 실행
- `npm run prisma:generate` - Prisma 클라이언트 생성
- `npm run prisma:migrate` - 데이터베이스 마이그레이션
- `npm run prisma:studio` - Prisma Studio 실행

## 다음 단계

1. 데이터베이스 연결 및 마이그레이션
2. 인증 컨트롤러 완성
3. 사용자 프로필 CRUD 구현
4. AI 서비스 통합 완성
5. 프론트엔드와 API 연동



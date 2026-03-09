# AWS App Runner 배포 가이드

가장 간단한 배포 방법입니다.

## 사전 준비

1. **GitHub 저장소 준비**
   - 백엔드 코드를 GitHub에 푸시

2. **AWS RDS PostgreSQL 생성**
   - RDS 콘솔에서 PostgreSQL 인스턴스 생성
   - 보안 그룹에서 App Runner 접근 허용

3. **AWS Systems Manager Parameter Store 설정**
   ```bash
   # AWS CLI로 환경 변수 저장
   aws ssm put-parameter \
     --name "/baesh/jwt-secret" \
     --value "your-jwt-secret" \
     --type "SecureString"

   aws ssm put-parameter \
     --name "/baesh/upstage-api-key" \
     --value "your-upstage-key" \
     --type "SecureString"

   aws ssm put-parameter \
     --name "/baesh/database-url" \
     --value "postgresql://user:pass@rds-endpoint:5432/baesh_career" \
     --type "SecureString"
   ```

## App Runner 서비스 생성

1. **AWS Console → App Runner → Create service**

2. **Source 설정**
   - Source: GitHub
   - Repository: baesh-career-backend
   - Branch: main
   - Build settings: Use a configuration file

3. **Build 설정** (apprunner.yaml 자동 생성됨)
   - Runtime: Node.js 20
   - Build command: `npm install && npm run prisma:generate && npm run build`
   - Start command: `npm start`

4. **Service 설정**
   - Service name: baesh-career-backend
   - Port: 3001
   - Environment variables:
     ```
     NODE_ENV=production
     PORT=3001
     JWT_SECRET=/baesh/jwt-secret
     UPSTAGE_API_KEY=/baesh/upstage-api-key
     DATABASE_URL=/baesh/database-url
     FRONTEND_URL=https://your-frontend-domain.com
     ```

5. **Auto scaling**
   - Min: 1
   - Max: 10
   - Concurrency: 100

6. **Create & Deploy**

## apprunner.yaml 생성

```yaml
version: 1.0
runtime: nodejs20
build:
  commands:
    build:
      - npm install
      - npm run prisma:generate
      - npm run build
run:
  runtime-version: 20
  command: npm start
  network:
    port: 3001
    env: PORT
  env:
    - name: NODE_ENV
      value: production
```

## 배포 후 확인

```bash
# App Runner 서비스 URL 확인
# 예: https://xxxxx.us-east-1.awsapprunner.com

# 헬스 체크
curl https://your-app-runner-url/health
```

## 자동 배포

GitHub에 푸시하면 자동으로 배포됩니다!



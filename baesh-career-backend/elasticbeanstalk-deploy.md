# AWS Elastic Beanstalk 배포 가이드

## 사전 준비

1. **EB CLI 설치**
   ```bash
   pip install awsebcli
   ```

2. **EB 초기화**
   ```bash
   cd baesh-career-backend
   eb init
   # - Region 선택
   # - Application name: baesh-career-backend
   # - Platform: Node.js
   # - Platform version: Node.js 20
   ```

## 배포

```bash
# 환경 생성 및 배포
eb create baesh-career-backend-env

# 또는 기존 환경에 배포
eb deploy
```

## 환경 변수 설정

```bash
eb setenv \
  NODE_ENV=production \
  PORT=3001 \
  JWT_SECRET=your-secret \
  UPSTAGE_API_KEY=your-key \
  DATABASE_URL=postgresql://... \
  FRONTEND_URL=https://...
```

## .ebextensions 설정

`.ebextensions/nodecommand.config` 파일 생성:

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
```



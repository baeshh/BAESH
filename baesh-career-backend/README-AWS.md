# AWS 배포 빠른 시작

## 🚀 가장 빠른 방법: AWS App Runner

1. **GitHub에 코드 푸시**
   ```bash
   git add .
   git commit -m "Initial backend setup"
   git push origin main
   ```

2. **AWS Console → App Runner → Create service**
   - Source: GitHub 연결
   - Repository: baesh-career-backend 선택
   - Build settings: Use configuration file (apprunner.yaml 자동 인식)

3. **환경 변수 설정**
   - AWS Systems Manager Parameter Store에 저장하거나
   - App Runner 환경 변수로 직접 입력

4. **배포 완료!** 🎉

## 📊 AWS 서비스 구성

```
┌─────────────────┐
│  App Runner     │ ← 백엔드 API
│  (Node.js)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│  RDS  │ │  S3   │
│(PostgreSQL)│ │(Storage)│
└───────┘ └───────┘
```

## 💰 예상 비용 (월)

- **App Runner**: ~$5-20 (트래픽에 따라)
- **RDS (db.t3.micro)**: ~$15 (프리티어 사용 시 무료)
- **S3**: ~$1-5 (사용량에 따라)
- **총 예상**: ~$20-40/월

## 🔧 필요한 AWS 권한

App Runner가 다음 서비스에 접근할 수 있어야 합니다:
- Systems Manager Parameter Store (읽기)
- RDS (연결)

IAM 역할에 다음 정책 추가:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/baesh/*"
    }
  ]
}
```

## 📝 체크리스트

- [ ] AWS 계정 생성
- [ ] RDS PostgreSQL 인스턴스 생성
- [ ] Systems Manager Parameter Store에 환경 변수 저장
- [ ] GitHub에 코드 푸시
- [ ] App Runner 서비스 생성
- [ ] 헬스 체크 확인
- [ ] 프론트엔드와 API 연동 테스트

## 🆘 문제 해결

### 데이터베이스 연결 실패
- RDS 보안 그룹에서 App Runner IP 허용
- DATABASE_URL 확인

### 환경 변수 로드 실패
- Systems Manager Parameter Store 권한 확인
- IAM 역할에 SSM 읽기 권한 추가

### 빌드 실패
- apprunner.yaml 확인
- 로컬에서 `npm run build` 테스트



# AWS 배포 가이드

BAESH Career Backend를 AWS에 배포하는 방법입니다.

## 추천 AWS 아키텍처

### 옵션 1: AWS App Runner (가장 간단) ⭐ 추천
- **장점**: 코드만 푸시하면 자동 배포, 자동 스케일링
- **비용**: 사용한 만큼만 지불
- **적합**: 빠른 배포, 관리 최소화

### 옵션 2: AWS Elastic Beanstalk
- **장점**: EC2 기반, 더 많은 제어권
- **비용**: EC2 인스턴스 비용
- **적합**: 더 세밀한 설정 필요 시

### 옵션 3: AWS Lambda + API Gateway (서버리스)
- **장점**: 완전 서버리스, 비용 효율적
- **단점**: 코드 구조 변경 필요
- **적합**: 트래픽이 예측 불가능할 때

## 필요한 AWS 서비스

1. **데이터베이스**: AWS RDS (PostgreSQL)
2. **애플리케이션**: App Runner / Elastic Beanstalk / Lambda
3. **스토리지**: S3 (이미지/파일 업로드)
4. **환경 변수**: Systems Manager Parameter Store
5. **도메인**: Route 53 (선택사항)

## 단계별 배포 가이드

### 1. AWS RDS PostgreSQL 설정

```bash
# AWS Console에서 RDS 인스턴스 생성
# - 엔진: PostgreSQL
# - 인스턴스 클래스: db.t3.micro (프리티어)
# - 스토리지: 20GB
# - 마스터 사용자명/비밀번호 설정
```

### 2. 환경 변수 설정 (Parameter Store)

AWS Systems Manager Parameter Store에 다음 값 저장:
- `/baesh/jwt-secret`
- `/baesh/upstage-api-key`
- `/baesh/database-url`

### 3. 배포 방법 선택

각 옵션별 상세 가이드는 아래 파일 참고:
- `apprunner-deploy.md` - App Runner 배포
- `elasticbeanstalk-deploy.md` - Elastic Beanstalk 배포
- `lambda-deploy.md` - Lambda 배포



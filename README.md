# IDC Rack Power Platform

42U 랙 기반 장비 배치, 전력 계산, A/B 전원 시뮬레이션, 이중화 후보 분석, PDF/이미지/CSV 저장을 지원하는 배포용 웹앱입니다.

## 실행 방법

```bash
npm install
npm run dev
```

## 배포 방법 Vercel

1. Vercel 접속
2. New Project
3. 이 폴더 업로드 또는 GitHub 연결
4. Deploy 클릭

## CSV 장비 DB 업로드 형식

```csv
brand,model,type,u,min,avg,max,image
HPE,DL380 Gen10,시스템,2,180,350,700,server
Cisco,Nexus 93180YC-FX,네트워크,1,180,350,650,switch
```

type 값: 시스템 / 네트워크 / 보안 / 스토리지 / 기타  
image 값: server / switch / firewall / security / storage

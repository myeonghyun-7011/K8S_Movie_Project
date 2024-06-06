# 베이스 이미지 설정
FROM node:14-alpine

# 작업 디렉토리를 설정합니다.
WORKDIR /usr/src/app

# package.json 및 package-lock.json 복사
COPY package*.json ./
COPY database.json ./

# 서버 의존성 패키지를 설치합니다.
RUN npm install

# frontend 폴더를 복사합니다.
COPY frontend ./frontend

# frontend 폴더 내부에서 npm install을 실행합니다.
WORKDIR /usr/src/app/frontend
RUN npm install

# 원래 작업 디렉토리로 이동합니다.
WORKDIR /usr/src/app

# React 프론트엔드 및 서버 소스 코드를 복사합니다.
COPY . .

# 포트를 노출합니다.
EXPOSE 5000

# 서버를 실행합니다.
CMD ["npm", "run", "dev"]

# syntax=docker/dockerfile:1

# ==========================================
# 1단계: 빌드 스테이지 (전체 의존성 + Vite 빌드)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# [최적화 팁] 의존성 캐싱을 위해 매니페스트 파일 먼저 복사
# 소스코드만 바뀌었을 때 npm ci 레이어를 재사용하여 빌드 속도 향상
COPY package.json package-lock.json ./
RUN npm ci

# 나머지 소스코드 복사 및 SSR 번들 생성 (dist/server, dist/client)
COPY . .
RUN npm run build

# ==========================================
# 2단계: 프로덕션 의존성만 별도 설치
# ==========================================
# TanStack Start의 서버 번들은 react, @tanstack/react-router 등을
# 외부 모듈로 남겨두므로 런타임에도 node_modules가 필요합니다.
# devDependencies(vite, eslint 등)를 제외해 이미지 용량을 줄입니다.
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ==========================================
# 3단계: 런타임 스테이지 (최소 구성)
# ==========================================
FROM node:22-alpine

WORKDIR /app

# 💡 최종 이미지에 내장된 npm의 tar(node-tar) 취약점(예: CVE-2026-59873) 패치를 위해
# npm 자체를 최신 버전으로 업그레이드합니다. builder 스테이지에서 업그레이드해도
# /usr/local 하위는 최종 이미지로 복사되지 않으므로 반드시 여기서 실행해야 합니다.
RUN npm install -g npm@latest

# 보안 가이드: 프로덕션에서는 절대 root 계정으로 컨테이너를 구동하지 않습니다.
# node 이미지에 이미 존재하는 uid 1000 'node' 계정을 사용합니다.
USER node

COPY --from=deps    --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist         ./dist
COPY --from=builder --chown=node:node /app/package.json ./package.json

# 🌟 [수정] 프로젝트 루트에 있는 프로덕션 서버 구동 파일을 복사합니다.
COPY --from=builder --chown=node:node /app/server.prod.mjs ./server.prod.mjs

# 쿠버네티스 컨테이너 환경을 위한 Node 런타임 옵션
# - max-old-space-size: 파드 메모리 Limit보다 낮게 잡아 OOMKilled 방지
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=384" \
    PORT=3000 \
    HOST=0.0.0.0

# 애플리케이션 포트 개방 (TanStack Start SSR 서버)
EXPOSE 3000

# 🌟 [수정] 핸들러가 아닌, 실제 리스닝 서버인 'server.prod.mjs'를 실행합니다.
CMD ["node", "server.prod.mjs"]

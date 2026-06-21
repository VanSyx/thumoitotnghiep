# Thiep Moi Tot Nghiep

Ung dung thiep moi tot nghiep gom React frontend va Express backend. Backend luu cau hinh thiep trong file JSON va serve ban build frontend de co the deploy nhu mot Node app.

## Chay local

```bash
npm install
npm.cmd run dev:server
npm.cmd run dev
```

- Frontend: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- API: `http://localhost:3001/api/health`

## Build production

```bash
npm.cmd run lint
npm.cmd run build
npm.cmd start
```

Production server mac dinh chay o `http://localhost:3001`.

## Bien moi truong

Tao file `.env` tu `.env.example` neu can:

```env
PORT=3001
ADMIN_TOKEN=your-admin-token
DATA_FILE=server/data/db.json
```

Neu `ADMIN_TOKEN` duoc set, trang admin can nhap dung token de luu du lieu.

## Docker

```bash
docker build -t thumoitotnghiep .
docker run -p 3001:3001 --env-file .env thumoitotnghiep
```

## CI/CD

Repo co san GitHub Actions:

- `CI`: cai dependencies, typecheck, build tren pull request va push vao `main`.
- `CD`: build Docker image va push len GitHub Container Registry tai `ghcr.io/VanSyx/thumoitotnghiep`.

Sau khi image duoc publish, co the deploy image `ghcr.io/VanSyx/thumoitotnghiep:latest` len Render, Railway, Fly.io, VPS, hoac bat ky dich vu ho tro Docker.

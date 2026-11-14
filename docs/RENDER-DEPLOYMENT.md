# CitizenQueue Render & MongoDB Atlas Deployment Guide

This guide provides step-by-step instructions for deploying the **CitizenQueue Backend** to **Render** and connecting it to a **MongoDB Atlas** database, alongside the Vercel-hosted frontend.

---

## 1. MongoDB Atlas Setup

1. **Log in / Sign Up** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Create a New Project**:
   - Name: `CitizenQueue`
3. **Deploy a Free Shared Cluster (M0)**:
   - Provider: AWS
   - Region: `af-south-1` (Cape Town) or `eu-west-1` (Ireland) for low latency to Ghana.
   - Cluster Name: `citizenqueue-cluster`
4. **Database User Authentication**:
   - Username: `cq_app_user`
   - Password: `<Generate a strong 24-character password>`
   - Role: `Read and write to any database`
5. **Network Access (IP Whitelist)**:
   - Add IP Address: `0.0.0.0/0` (Allow Access from Anywhere)
   - *Note: Render uses dynamic outbound IPs, so `0.0.0.0/0` is required for reliable cloud database connectivity.*
6. **Obtain Connection String**:
   - Click **Connect** -> **Drivers** (Node.js).
   - Format:
     ```
     mongodb+srv://cq_app_user:<PASSWORD>@citizenqueue-cluster.xxxx.mongodb.net/citizenqueue?retryWrites=true&w=majority
     ```

---

## 2. Render Web Service Deployment

1. **Log in / Sign Up** at [Render](https://render.com).
2. **Create New Web Service**:
   - Connect your GitHub repository containing CitizenQueue.
3. **Configure Service Details**:
   - **Name**: `citizenqueue-api`
   - **Region**: Frankfurt (EU Central) or Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `Backend` (Crucial: specifies the backend subfolder)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free` (or `Starter` for persistent background jobs)

---

## 3. Environment Variables Configuration on Render

In the **Environment** tab on Render, add the following variables:

| Variable Key | Sample Production Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & secure cookies |
| `PORT` | `10000` | Port automatically assigned by Render |
| `MONGO_URI` | `mongodb+srv://cq_app_user:<PASSWORD>@citizenqueue-cluster.xxxx.mongodb.net/citizenqueue?retryWrites=true&w=majority` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | `<Generate 64-char random hex string>` | Secret used to sign access tokens |
| `JWT_REFRESH_SECRET` | `<Generate 64-char random hex string>` | Secret used to sign refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifespan |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifespan |
| `CLIENT_URL` | `https://citizenqueue.vercel.app` | Production Vercel URL of the frontend |
| `ALLOWED_ORIGINS` | `https://citizenqueue.vercel.app,http://localhost:5173` | Comma-separated CORS origins |
| `STORAGE_PROVIDER` | `mock` (or `s3`) | Use `s3` when S3/R2 bucket is connected |
| `STORAGE_BUCKET` | `citizenqueue-vault` | Object storage bucket name |
| `STORAGE_REGION` | `af-south-1` | S3 bucket region |
| `STORAGE_ACCESS_KEY` | `<AWS_ACCESS_KEY_ID>` | IAM credentials for S3 uploads |
| `STORAGE_SECRET_KEY` | `<AWS_SECRET_ACCESS_KEY>` | IAM credentials for S3 uploads |

---

## 4. Database Seeding

To populate initial institutions (Achimota, Prempeh, UG, KNUST), services, digital prospectus items, and default capacity slots on your production Atlas cluster:

### Option A: From Local Terminal Pointed to Atlas
```bash
cd Backend
MONGO_URI="mongodb+srv://cq_app_user:<PASSWORD>@citizenqueue-cluster.xxxx.mongodb.net/citizenqueue?retryWrites=true&w=majority" npm run seed
```

### Option B: Using Render Shell
1. Navigate to your Web Service in Render.
2. Click **Shell** in the left sidebar.
3. Run:
   ```bash
   node scripts/seedDatabase.js
   ```

---

## 5. Connecting Vercel Frontend to Render Backend

1. Navigate to your Vercel project dashboard for **Frontend**.
2. Go to **Settings** -> **Environment Variables**.
3. Add or update:
   ```env
   VITE_API_BASE_URL=https://citizenqueue-api.onrender.com/api/v1
   ```
4. Redeploy the frontend.

---

## 6. Verification & Health Monitoring

1. **Verify Healthcheck**:
   Open in your browser:
   ```http
   GET https://citizenqueue-api.onrender.com/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "service": "citizenqueue-backend",
     "version": "1.0.0",
     "timestamp": "2026-10-30T12:00:00.000Z",
     "uptimeSeconds": 142,
     "environment": "production"
   }
   ```

2. **Render Health Check Path**:
   In Render -> **Settings** -> **Health Check Path**, enter:
   `/health`
   Render will automatically ping this endpoint to ensure zero-downtime deployments.

# Vercel Deployment Guide

## Prerequisites

- [x] GitHub repository with quiz-app code
- [x] Neon database setup with connection string
- [ ] Vercel account created

## Deployment Checklist

### 1. Vercel Account Setup

- [ ] Go to [https://vercel.com](https://vercel.com)
- [ ] Sign up with GitHub account
- [ ] Authorize Vercel to access your repositories

### 2. Project Import

- [ ] Click "New Project" in Vercel dashboard
- [ ] Import your `quiz-app` repository from GitHub
- [ ] Verify Next.js framework is detected automatically

### 3. Environment Variables Configuration

- [ ] Go to Project Settings → Environment Variables
- [ ] Add `DATABASE_URL` with your Neon connection string
- [ ] Select all environments (Production, Preview, Development)
- [ ] Save the configuration

### 4. Initial Deployment

- [ ] Click "Deploy" button
- [ ] Wait for build to complete (usually 2-3 minutes)
- [ ] Verify deployment success

### 5. Verification Steps

- [ ] Visit your deployed app URL
- [ ] Test the health check endpoint: `https://your-app.vercel.app/api/health`
- [ ] Verify database connection is working
- [ ] Check that the app loads without errors

### 6. Automatic Deployment Setup

- [ ] Verify automatic deployments are enabled (default)
- [ ] Test by making a small change and pushing to main branch
- [ ] Confirm new deployment is triggered automatically

## Post-Deployment

### Domain Configuration (Optional)

- [ ] Add custom domain in Vercel project settings
- [ ] Configure DNS records if using custom domain

### Monitoring

- [ ] Check Vercel Analytics (if enabled)
- [ ] Monitor function logs in Vercel dashboard
- [ ] Set up error tracking if needed

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in package.json
2. **Database Connection Error**: Verify DATABASE_URL is correctly set
3. **Prisma Issues**: Ensure `prisma generate` runs during build

### Health Check Endpoints:

- Production: `https://your-app.vercel.app/api/health`
- Preview: `https://your-app-git-branch.vercel.app/api/health`

## Environment Variables Reference

| Variable       | Description                       | Required |
| -------------- | --------------------------------- | -------- |
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes      |

Example DATABASE_URL format:

```
postgresql://username:password@host:5432/database?sslmode=require
```

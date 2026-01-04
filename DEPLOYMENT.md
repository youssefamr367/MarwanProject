# Vercel Deployment Guide

## Environment Variables Required

Set these in your Vercel dashboard under Settings > Environment Variables:

1. **MONGO_URI**: Your MongoDB connection string

   - Example: `mongodb+srv://username:password@cluster.mongodb.net/database_name`

2. **FRONTEND_URL**: Your Vercel app URL (will be provided after deployment)

   - Example: `https://your-app-name.vercel.app`

3. **NODE_ENV**: Set to `production`

## Deployment Steps

1. **Connect to Vercel**:

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

2. **Set Environment Variables**:

   - In Vercel dashboard, go to your project
   - Navigate to Settings > Environment Variables
   - Add the variables listed above

3. **Deploy**:
   - Vercel will automatically build and deploy
   - The frontend will be served from the root
   - API routes will be available at `/api/*`

## Project Structure for Vercel

- **Frontend**: Built from `/frontend` directory
- **Backend**: API functions in `/api` directory
- **Static Files**: Served from `/frontend/dist`

## API Routes

Your API will be available at:

- `/api/Product/*` - Product routes
- `/api/Order/*` - Order routes
- `/api/suppliers/*` - Supplier routes
- `/api/fabrics/*` - Fabric routes
- `/api/eshra/*` - Eshra routes
- `/api/paintings/*` - Painting routes
- `/api/marbles/*` - Marble routes
- `/api/glass/*` - Glass routes

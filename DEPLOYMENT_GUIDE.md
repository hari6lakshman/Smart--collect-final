# Deploying Smart Collect to Vercel

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Your project files ready (already done ✅)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended - No Git Required)

1. **Visit Vercel**
   - Go to https://vercel.com
   - Sign up or log in with your GitHub, GitLab, or Bitbucket account

2. **Create New Project**
   - Click "Add New..." → "Project"
   - Choose "Import from local folder" or drag and drop your project folder

3. **Configure Project**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Add Environment Variables** ⚠️ IMPORTANT
   Click "Environment Variables" and add:
   ```
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```
   (Copy the value from your `.env.local` file)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - You'll get a live URL like: `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Add environment variables when asked

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Important Notes

### Environment Variables
Your `.env.local` file is NOT uploaded to Vercel (it's in `.gitignore`).
You MUST add your environment variables in the Vercel dashboard:
- Go to your project settings
- Navigate to "Environment Variables"
- Add: `GOOGLE_GENAI_API_KEY`

### Build Configuration
Your project is already configured correctly:
- ✅ `next.config.ts` exists
- ✅ TypeScript build errors are ignored
- ✅ ESLint errors are ignored during build
- ✅ Dependencies are properly listed in `package.json`

### Custom Domain (Optional)
After deployment, you can add a custom domain:
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `package.json` has all dependencies

### API Key Issues
- Make sure `GOOGLE_GENAI_API_KEY` is set in Vercel environment variables
- Redeploy after adding environment variables

### Performance
- Vercel automatically optimizes your Next.js app
- Uses Edge Network for fast global delivery
- Automatic HTTPS

## Post-Deployment

1. **Test Your Site**
   - Visit the provided Vercel URL
   - Test all features (login, admin dashboard, AI features)
   - Verify API key is working

2. **Monitor**
   - Check Vercel Analytics (free tier available)
   - Monitor function logs for errors

3. **Updates**
   - To update: Simply redeploy through Vercel dashboard
   - Or use `vercel --prod` if using CLI

## Your Project URL
After deployment, your site will be available at:
`https://smart-collect-[random-id].vercel.app`

You can customize this in project settings!

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

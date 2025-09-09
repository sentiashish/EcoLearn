# Deployment Guide

This guide provides step-by-step instructions for deploying the Environmental Education Platform to production.

## Quick Start Checklist

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Custom domains set up (optional)
- [ ] SSL certificates configured
- [ ] Database migrations run
- [ ] Static files configured

## Backend Deployment (Render)

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub
2. Update `render.yaml` with your specific configuration:
   ```yaml
   # Replace these placeholders:
   name: your-app-name-backend  # Change from 'enviro-edu-backend'
   ALLOWED_HOSTS: your-app-name-backend.onrender.com,your-domain.com
   CORS_ALLOWED_ORIGINS: https://your-frontend.vercel.app,https://your-domain.com
   CSRF_TRUSTED_ORIGINS: https://your-frontend.vercel.app,https://your-domain.com
   ```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account
3. Grant access to your repository

### Step 3: Deploy Backend

1. Click "New +" → "Blueprint"
2. Connect your GitHub repository
3. Select the repository containing your code
4. Render will automatically detect the `render.yaml` file
5. Review the configuration and click "Apply"

### Step 4: Configure Environment Variables

Render will automatically create most environment variables from `render.yaml`, but you may need to add:

```env
# External API keys (if using)
OPENAI_API_KEY=your_openai_key
GOOGLE_MAPS_API_KEY=your_maps_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email configuration
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

### Step 5: Verify Backend Deployment

1. Wait for deployment to complete (5-10 minutes)
2. Visit your backend URL: `https://your-app-name-backend.onrender.com`
3. Check API health: `https://your-app-name-backend.onrender.com/api/v1/health/`
4. Verify admin panel: `https://your-app-name-backend.onrender.com/admin/`

## Frontend Deployment (Vercel)

### Step 1: Update Configuration

1. Update `frontend/.env.production`:
   ```env
   VITE_API_BASE_URL=https://your-app-name-backend.onrender.com/api/v1
   VITE_WS_BASE_URL=wss://your-app-name-backend.onrender.com/ws
   VITE_APP_NAME=Your App Name
   ```

2. Update `frontend/vercel.json`:
   ```json
   {
     "env": {
       "VITE_API_BASE_URL": "https://your-app-name-backend.onrender.com/api/v1"
     },
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://your-app-name-backend.onrender.com/api/v1/$1"
       }
     ]
   }
   ```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from frontend directory:
   ```bash
   cd frontend
   vercel --prod
   ```

#### Option B: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to `frontend`
5. Configure environment variables
6. Click "Deploy"

### Step 3: Configure Environment Variables in Vercel

In Vercel dashboard → Project Settings → Environment Variables:

```env
VITE_API_BASE_URL=https://your-app-name-backend.onrender.com/api/v1
VITE_WS_BASE_URL=wss://your-app-name-backend.onrender.com/ws
VITE_APP_NAME=Your App Name
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
VITE_MOCK_API=false
VITE_DEBUG_MODE=false
```

### Step 4: Verify Frontend Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test user registration and login
3. Verify API connectivity
4. Check responsive design on mobile

## Custom Domain Setup (Optional)

### Backend Custom Domain (Render)

1. In Render dashboard → Your Service → Settings
2. Scroll to "Custom Domains"
3. Add your domain: `api.yourdomain.com`
4. Configure DNS:
   ```
   Type: CNAME
   Name: api
   Value: your-app-name-backend.onrender.com
   ```

### Frontend Custom Domain (Vercel)

1. In Vercel dashboard → Project Settings → Domains
2. Add your domain: `yourdomain.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

## SSL Certificates

Both Render and Vercel automatically provide SSL certificates for:
- Default subdomains (*.onrender.com, *.vercel.app)
- Custom domains (automatically issued via Let's Encrypt)

## Database Management

### Running Migrations

Render automatically runs migrations during deployment, but you can also run them manually:

1. In Render dashboard → Your Service → Shell
2. Run migration commands:
   ```bash
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```

### Creating Superuser

1. Access Render shell
2. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

### Database Backups

Render automatically backs up PostgreSQL databases. You can also create manual backups:

1. In Render dashboard → Database → Backups
2. Click "Create Backup"

## Monitoring and Logging

### Render Logs

- View logs in Render dashboard → Your Service → Logs
- Set up log retention and alerts

### Vercel Logs

- View function logs in Vercel dashboard → Project → Functions
- Monitor performance and errors

### Error Tracking (Optional)

Integrate Sentry for error tracking:

1. Create Sentry account
2. Add `SENTRY_DSN` to environment variables
3. Configure error reporting in both frontend and backend

## Performance Optimization

### Frontend Optimization

- Enable Vercel Analytics
- Configure caching headers
- Optimize images and assets
- Enable PWA features

### Backend Optimization

- Configure Redis caching
- Optimize database queries
- Set up CDN for static files
- Monitor API performance

## Security Checklist

- [ ] HTTPS enabled (automatic)
- [ ] CORS properly configured
- [ ] CSRF protection enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API rate limiting configured
- [ ] Security headers set
- [ ] Regular dependency updates

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Verify `CORS_ALLOWED_ORIGINS` includes your frontend domain
   - Check `CSRF_TRUSTED_ORIGINS` configuration

2. **API Connection Issues**:
   - Verify `VITE_API_BASE_URL` is correct
   - Check network connectivity
   - Review Render service logs

3. **Database Connection Issues**:
   - Verify `DATABASE_URL` is set correctly
   - Check database service status in Render

4. **Build Failures**:
   - Check build logs in Render/Vercel
   - Verify all dependencies are listed
   - Check Python/Node.js versions

### Getting Help

- Check service status pages: [Render Status](https://status.render.com), [Vercel Status](https://vercel-status.com)
- Review documentation: [Render Docs](https://render.com/docs), [Vercel Docs](https://vercel.com/docs)
- Contact support through respective platforms

## Maintenance

### Regular Tasks

- Monitor application performance
- Update dependencies regularly
- Review and rotate API keys
- Monitor database usage
- Check error logs
- Backup important data

### Scaling

- **Render**: Upgrade service plans as needed
- **Vercel**: Automatic scaling for frontend
- **Database**: Monitor usage and upgrade plan
- **Redis**: Scale based on caching needs

This completes the deployment setup for your Environmental Education Platform!
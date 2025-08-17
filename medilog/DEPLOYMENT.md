# MediLog Deployment Guide

This guide covers deploying MediLog to various platforms including Vercel, Netlify, and self-hosted environments.

## 🚀 Vercel Deployment (Recommended)

Vercel is the recommended deployment platform for Next.js applications.

### 1. Prerequisites
- GitHub repository with your MediLog code
- Vercel account ([Sign up here](https://vercel.com/))

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
5. Click "Deploy"

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to configure your project
```

### 3. Environment Variables
Set these in your Vercel project dashboard:

1. Go to Project Settings → Environment Variables
2. Add each variable from your `.env.local`:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_jwt_secret_key_here
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_nextauth_secret_here
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg,image/jpg
   ```

### 4. Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain

## 🌐 Netlify Deployment

### 1. Prerequisites
- GitHub repository with your MediLog code
- Netlify account ([Sign up here](https://netlify.com/))

### 2. Deploy to Netlify

#### Option A: Deploy via Netlify Dashboard
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "New site from Git"
3. Choose your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: 18 (or higher)
5. Click "Deploy site"

#### Option B: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

### 3. Environment Variables
Set these in your Netlify site dashboard:

1. Go to Site Settings → Environment Variables
2. Add each variable from your `.env.local`
3. Ensure `NEXTAUTH_URL` points to your Netlify domain

## 🐳 Docker Deployment

### 1. Create Dockerfile
```dockerfile
# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### 2. Create Docker Compose
```yaml
version: '3.8'
services:
  medilog:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - MAX_FILE_SIZE=${MAX_FILE_SIZE}
      - ALLOWED_FILE_TYPES=${ALLOWED_FILE_TYPES}
    restart: unless-stopped
```

### 3. Deploy with Docker
```bash
# Build and run
docker-compose up -d

# Or build manually
docker build -t medilog .
docker run -p 3000:3000 --env-file .env.local medilog
```

## ☁️ AWS Deployment

### 1. AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB project
eb init

# Create environment
eb create medilog-prod

# Deploy
eb deploy
```

### 2. AWS Lambda + API Gateway
1. Build the application: `npm run build`
2. Package for Lambda
3. Upload to S3
4. Create Lambda function
5. Configure API Gateway

## 🔧 Self-Hosted Deployment

### 1. Server Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **Node.js**: 18+ LTS
- **Memory**: 2GB+ RAM
- **Storage**: 20GB+ SSD
- **Network**: Public IP with ports 80/443 open

### 2. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 3. Application Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/medilog.git
cd medilog

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "medilog" -- start
pm2 save
pm2 startup
```

### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL Certificate
```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Environment-Specific Configurations

### Development
```env
NODE_ENV=development
DEBUG=true
NEXTAUTH_URL=http://localhost:3000
```

### Staging
```env
NODE_ENV=staging
NEXTAUTH_URL=https://staging.your-domain.com
```

### Production
```env
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
```

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use secure secret management services
- Rotate secrets regularly

### 2. Database Security
- Use strong passwords
- Enable network restrictions
- Enable encryption at rest
- Regular backups

### 3. API Security
- Enable rate limiting
- Use HTTPS everywhere
- Implement proper CORS policies
- Monitor for suspicious activity

### 4. File Storage Security
- Enable Row Level Security (RLS)
- Use signed URLs for file access
- Implement file type validation
- Scan uploaded files for malware

## 📈 Performance Optimization

### 1. Build Optimization
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Optimize images
# Use Next.js Image component
# Implement lazy loading
```

### 2. Database Optimization
- Create proper indexes
- Use connection pooling
- Implement caching strategies
- Monitor query performance

### 3. CDN Configuration
- Use Vercel's Edge Network
- Configure Supabase CDN
- Implement browser caching
- Use compression

## 🧪 Testing Deployment

### 1. Health Checks
```bash
# Test basic functionality
curl https://your-domain.com/api/health

# Test authentication
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'
```

### 2. Load Testing
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

### 3. Monitoring
- Set up uptime monitoring
- Configure error tracking (Sentry)
- Monitor performance metrics
- Set up alerting

## 🔄 CI/CD Pipeline

### 1. GitHub Actions
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 2. Environment-Specific Deployments
- **Main branch**: Deploy to production
- **Develop branch**: Deploy to staging
- **Feature branches**: Deploy to preview environments

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check Node.js version
node --version

# Verify dependencies
npm ci
```

#### Runtime Errors
```bash
# Check logs
pm2 logs medilog

# Restart application
pm2 restart medilog

# Check environment variables
echo $MONGODB_URI
```

#### Performance Issues
- Monitor memory usage
- Check database connections
- Analyze slow queries
- Review API response times

## 📞 Support

For deployment issues:
1. Check this guide
2. Review platform-specific documentation
3. Check GitHub Issues
4. Create detailed issue reports

---

**Happy Deploying! 🚀**

Your MediLog application should now be successfully deployed and accessible to users worldwide.

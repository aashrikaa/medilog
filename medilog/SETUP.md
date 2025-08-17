# MediLog Setup Guide

This guide will walk you through setting up MediLog on your local development environment.

## 🚀 Prerequisites

### Required Software
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **Modern web browser** - Chrome, Firefox, Safari, or Edge

### Required Accounts
- **MongoDB Atlas** - [Sign up here](https://www.mongodb.com/atlas)
- **Supabase** - [Sign up here](https://supabase.com/)
- **Google AI Studio** - [Sign up here](https://makersuite.google.com/)

## 📋 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/medilog.git
cd medilog
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Copy the example file
cp env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medilog?retryWrites=true&w=majority

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg,image/jpg
```

### 4. MongoDB Atlas Setup

1. **Create a Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create"

2. **Set Up Database Access**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Select "Read and write to any database"
   - Click "Add User"

3. **Set Up Network Access**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

4. **Get Connection String**:
   - Go to "Database" in the left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `medilog`

### 5. Supabase Setup

1. **Create a Project**:
   - Go to [Supabase](https://supabase.com/)
   - Click "New Project"
   - Choose your organization
   - Enter project name (e.g., "medilog")
   - Enter database password (save this!)
   - Choose region closest to you
   - Click "Create new project"

2. **Create Storage Bucket**:
   - Go to "Storage" in the left sidebar
   - Click "Create a new bucket"
   - Name: `medical-documents`
   - Make it public (for now, we'll secure with RLS)
   - Click "Create bucket"

3. **Set Up Row Level Security (RLS)**:
   - Go to "Storage" → "Policies"
   - Click "New Policy"
   - Choose "Create a policy from scratch"
   - Name: `Secure medical documents`
   - Policy definition:
   ```sql
   CREATE POLICY "Users can only access their own documents" ON storage.objects
   FOR ALL USING (auth.uid()::text = (storage.foldername(name))[1]);
   ```
   - Click "Review" then "Save policy"

4. **Get API Keys**:
   - Go to "Settings" → "API" in the left sidebar
   - Copy "Project URL" and "anon public" key
   - Copy "service_role" key (keep this secret!)

### 6. Google Gemini Setup

1. **Get API Key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key

2. **Enable Gemini Model**:
   - The API key automatically gives access to Gemini 1.5 Flash
   - No additional setup needed

### 7. Generate JWT Secret

Generate a secure JWT secret:

```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 64

# Option 3: Use online generator (less secure)
# https://generate-secret.vercel.app/64
```

### 8. Run the Application

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

## 🧪 Testing the Setup

### 1. Test Authentication
- Navigate to `/auth/register`
- Create a test account
- Verify you can log in

### 2. Test File Upload
- Go to the dashboard
- Try uploading a PDF document
- Verify it appears in the document list

### 3. Test AI Processing
- Upload a lab report PDF
- Check if lab values are extracted
- Verify health insights are generated

### 4. Test Reminders
- Go to the reminders page
- Create a test reminder
- Verify it appears in the list

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```
Error: connect ECONNREFUSED
```
**Solution**: Check your connection string and ensure network access is configured correctly.

#### Supabase Storage Error
```
Error: 403 Forbidden
```
**Solution**: Verify RLS policies are set up correctly and the bucket exists.

#### AI Processing Failed
```
Error: Invalid API key
```
**Solution**: Check your Google Gemini API key and ensure it's valid.

#### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution**: The app will automatically try the next available port, or kill the process using port 3000.

### Debug Mode

Enable debug logging by adding to `.env.local`:

```env
DEBUG=true
NODE_ENV=development
```

### Check Logs

```bash
# View Next.js logs
npm run dev

# Check MongoDB connection
# Look for connection success/error messages in console

# Check Supabase connection
# Look for storage bucket access messages
```

## 📱 Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Keep your JWT secret secure and unique
- Use strong passwords for database accounts
- Regularly rotate API keys
- Monitor API usage and quotas

## 🚀 Next Steps

After successful setup:

1. **Explore the Codebase**: Check out the project structure
2. **Read the Documentation**: Review README.md and API docs
3. **Make Changes**: Start developing new features
4. **Test Thoroughly**: Ensure all functionality works
5. **Deploy**: Consider deploying to Vercel or similar platform

## 📞 Getting Help

If you encounter issues:

1. Check this setup guide
2. Review the README.md
3. Check GitHub Issues
4. Create a new issue with detailed error information
5. Join our community discussions

---

**Happy coding! 🎉**

Your MediLog application should now be running locally and ready for development.

# MediLog - Medical Document Management & AI Insights

MediLog is a comprehensive medical document management system that uses AI to extract lab values, generate health insights, and provide secure storage for medical records. Built with Next.js, MongoDB, and Supabase, it offers a modern, responsive interface with dual language support (English/Nepali) and a sophisticated health reminder system.

## 🚀 Features

### Core Document Management
- **Multi-Format Upload**: Support for PDF, DOCX, TXT, PNG, JPEG, and JPG files
- **AI-Powered Processing**: Automatic lab value extraction using Google Gemini AI (Lab Reports only)
- **Smart Categorization**: Organize documents by type (Lab Reports, Prescriptions, Imaging, Other)
- **Advanced Search & Filtering**: Search by filename, tags, category, content, date range, and file type
- **Bulk Operations**: Select multiple files for tagging, download, or deletion
- **Document Viewing**: In-browser document viewing with dedicated view button

### Health Insights & Analytics
- **Lab Value Extraction**: Automatically detect and extract common lab test results
- **Advanced Trend Analysis**: Comprehensive statistical analysis with trend direction, status changes, and key insights
- **Modern Chart Visualization**: Custom SVG-based line charts with interactive data points
- **Test Name Normalization**: Group similar lab test names for consistent trending
- **Status Indicators**: Color-coded results (normal, high, low, critical)
- **AI Summaries**: Generate medical document summaries highlighting key findings
- **Abnormal Value Alerts**: Get notified of results outside normal ranges

### Health Reminder System
- **Medication Tracking**: Set reminders for medicine refills and dosages
- **Appointment Management**: Schedule and track doctor appointments
- **Health Maintenance**: Vaccination, screening, and health check reminders
- **Dual Calendar Support**: Both AD (Gregorian) and BS (Bikram Sambat) dates
- **Smart Notifications**: Browser notifications triggered 5 days before due dates
- **Recurring Reminders**: Daily, weekly, monthly, or yearly recurring schedules
- **Priority Levels**: Low, medium, high, and urgent priority settings

### User Experience
- **Responsive Design**: Fully functional on desktop, tablet, and mobile
- **Dual Language**: English and Nepali (नेपाली) interface support
- **Health Profile**: Store blood type, allergies, and emergency contacts
- **QR Health Summary**: Generate emergency health information QR codes
- **Advanced Filtering**: Filter documents by date, type, and category
- **Modern UI**: Clean, professional interface with Tailwind CSS

### Security & Privacy
- **End-to-End Encryption**: Secure file storage with Supabase
- **Row Level Security**: Users can only access their own documents
- **JWT Authentication**: Secure login with email/password
- **GDPR Compliance**: Easy data export and deletion
- **Access Logs**: Detailed tracking of document access and modifications

## 🛠️ Technology Stack

### Frontend
- **Next.js 14+** with App Router and TypeScript
- **Tailwind CSS** for responsive, utility-first styling
- **React Hook Form + Zod** for form validation
- **Lucide React** for beautiful icons
- **Custom SVG Charts** for health trend visualization
- **React Dropzone** for file upload handling

### Backend
- **MongoDB Atlas** for document metadata, user profiles, and reminders
- **Mongoose** for schema management and validation
- **Next.js API Routes** for serverless backend logic
- **JWT** for secure authentication
- **Node-cron** for scheduled reminder processing

### AI & Storage
- **Google Gemini API** (gemini-1.5-flash) for medical document analysis
- **Supabase Storage** for encrypted file storage
- **pdf-parse** for PDF text extraction
- **mammoth** for DOCX text extraction
- **tesseract.js** for OCR image text extraction
- **Sharp** for image processing

### Utilities & Internationalization
- **Bikram Sambat** for Nepali calendar support
- **date-fns** for date manipulation
- **QR Code generation** for health summaries
- **Custom calendar utilities** for AD/BS date conversion

### Deployment
- **Vercel** for frontend hosting and API functions
- **MongoDB Atlas** for cloud database hosting
- **Supabase** for secure file storage

## 📋 Prerequisites

Before running MediLog, ensure you have:

- **Node.js 18+** and npm/yarn
- **MongoDB Atlas** account (free tier available)
- **Supabase** account (free tier available)
- **Google Gemini API** key (free tier available)
- **Modern web browser** with notification support

## 🚀 Quick Start

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

### 4. Database Setup
1. **MongoDB Atlas**:
   - Create a new cluster (free tier available)
   - Set up database user with read/write permissions
   - Configure network access (IP whitelist or 0.0.0.0/0 for development)
   - Get your connection string

2. **Supabase**:
   - Create a new project
   - Create a storage bucket named `medical-documents`
   - Set up Row Level Security (RLS) policies
   - Get your project URL and API keys

3. **Google Gemini**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key
   - Enable the Gemini 1.5 Flash model

### 5. Run the Application
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage Guide

### Getting Started
1. **Create Account**: Sign up with your email and password
2. **Upload Documents**: Drag and drop medical documents (PDF, DOCX, images, etc.)
3. **AI Processing**: Wait for automatic lab value extraction (Lab Reports only)
4. **Review Results**: Verify extracted data and make corrections
5. **Track Trends**: Monitor health metrics over time with advanced analytics

### Document Management
- **Upload**: Drag files or click to browse (supports multiple formats)
- **Categorize**: Select document type and add tags
- **Search & Filter**: Use advanced filters by date, type, and category
- **View & Download**: Access documents in browser or download PDFs
- **AI Analysis**: Automatic text extraction and lab value parsing

### Health Insights
- **Dashboard**: Overview of recent lab results and document counts
- **Trend Analysis**: Statistical analysis with trend direction and insights
- **Test Trends**: Interactive charts showing health progression across documents
- **Abnormal Values**: Highlighted results outside normal ranges

### Reminder System
- **Create Reminders**: Set medication, appointment, and health check reminders
- **Smart Scheduling**: Automatic reminder calculation (5 days before due date)
- **Dual Calendar**: Support for both AD and BS dates
- **Notifications**: Browser notifications for upcoming reminders
- **Priority Management**: Set urgency levels for different reminders

## 🔒 Security Features

- **Authentication**: JWT-based user authentication
- **Authorization**: User-specific document and reminder access
- **Encryption**: Files encrypted at rest in Supabase
- **Validation**: Input sanitization and type checking with Zod
- **Audit Logs**: Track document access and modifications
- **Row Level Security**: Supabase RLS policies for data isolation

## 🌐 Internationalization

MediLog supports both English and Nepali languages:

- **English**: Primary interface language
- **Nepali (नेपाली)**: Full interface translation
- **Bikram Sambat**: Nepali calendar date display
- **Localized Content**: Region-specific medical terminology

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Documents
- `GET /api/documents` - Fetch user documents with filtering
- `POST /api/documents/upload` - Upload new document with AI processing
- `GET /api/documents/[id]` - Get specific document
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document
- `GET /api/documents/[id]/download` - Download/view PDF

### Lab Values
- `GET /api/lab-values` - Fetch extracted lab values with document grouping

### Reminders
- `GET /api/reminders` - Fetch user reminders with filtering
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/[id]` - Update reminder
- `DELETE /api/reminders/[id]` - Delete reminder
- `PUT /api/reminders/[id]/complete` - Mark reminder as completed

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
medilog/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   └── reminders/         # Reminder management
├── components/             # React components
│   ├── DocumentUpload.tsx # File upload component
│   ├── DocumentList.tsx   # Document display
│   ├── HealthInsights.tsx # Health analytics
│   ├── ReminderForm.tsx   # Reminder creation
│   └── ReminderList.tsx   # Reminder display
├── lib/                    # Utility libraries
│   ├── ai.ts              # AI processing
│   ├── auth.ts            # Authentication
│   ├── calendar.ts        # Date utilities
│   ├── database.ts        # MongoDB connection
│   ├── notifications.ts   # Browser notifications
│   └── supabase.ts        # Supabase client
├── models/                 # Mongoose schemas
│   ├── Document.ts        # Document model
│   ├── LabValue.ts        # Lab value model
│   ├── Reminder.ts        # Reminder model
│   └── User.ts            # User model
├── types/                  # TypeScript types
└── public/                 # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add comprehensive comments
- Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.medilog.app](https://docs.medilog.app)
- **Issues**: [GitHub Issues](https://github.com/yourusername/medilog/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/medilog/discussions)
- **Email**: support@medilog.app

## 🙏 Acknowledgments

- **Google Gemini AI** for medical document analysis
- **Supabase** for secure file storage
- **MongoDB Atlas** for database hosting
- **Next.js Team** for the amazing framework
- **Medical professionals** for domain expertise
- **Open source community** for various libraries and tools

## 🔮 Roadmap

### Short Term (Next 3 months)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with health devices
- [ ] Telemedicine features

### Medium Term (3-6 months)
- [ ] Multi-language support expansion
- [ ] Advanced AI models for diagnosis
- [ ] HIPAA compliance features
- [ ] Team collaboration tools

### Long Term (6+ months)
- [ ] Machine learning for predictive health insights
- [ ] Integration with electronic health records
- [ ] Advanced reporting and analytics
- [ ] API for third-party integrations

## 📊 Performance & Scalability

- **File Processing**: Optimized for documents up to 10MB
- **AI Processing**: Asynchronous processing with error handling
- **Database**: Indexed queries for fast retrieval
- **Storage**: Efficient file compression and organization
- **Caching**: Smart caching for frequently accessed data

## 🔧 Troubleshooting

### Common Issues
1. **MongoDB Connection**: Check connection string and network access
2. **Supabase Storage**: Verify bucket permissions and RLS policies
3. **AI Processing**: Ensure Gemini API key is valid and has quota
4. **File Uploads**: Check file size limits and supported formats

### Performance Tips
- Use appropriate file formats (PDF for documents, optimized images)
- Regular database maintenance and indexing
- Monitor API usage and quotas
- Implement proper error handling and logging

---

**MediLog** - Empowering patients with AI-powered health insights, secure medical document management, and intelligent health reminders.

*Built with ❤️ for better healthcare management*

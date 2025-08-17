# MediLog API Documentation

This document provides comprehensive information about the MediLog API endpoints, request/response formats, and authentication methods.

## 🔐 Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`

The response will include a JWT token that should be used for subsequent requests.

## 📚 API Endpoints

### Authentication

#### POST /api/auth/register

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id_here",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/login

Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id_here",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token_here"
}
```

### Documents

#### GET /api/documents

Fetch user documents with optional filtering.

**Query Parameters:**
- `search` (string): Search in filename, tags, or content
- `category` (string): Filter by document category
- `dateFrom` (string): Filter documents from this date (ISO format)
- `dateTo` (string): Filter documents to this date (ISO format)
- `fileType` (string): Filter by file type (lab/non-lab)

**Example Request:**
```http
GET /api/documents?search=blood&category=Lab Reports&dateFrom=2024-01-01
Authorization: Bearer <token>
```

**Response:**
```json
{
  "documents": [
    {
      "_id": "doc_id_here",
      "filename": "blood_test.pdf",
      "category": "Lab Reports",
      "fileType": "application/pdf",
      "fileSize": 1048576,
      "tags": ["blood", "test"],
      "uploadDate": "2024-01-15T10:30:00Z",
      "aiProcessed": true,
      "labValuesCount": 15,
      "summary": "Blood test results showing normal ranges...",
      "userId": "user_id_here"
    }
  ],
  "total": 1,
  "filters": {
    "search": "blood",
    "category": "Lab Reports",
    "dateFrom": "2024-01-01"
  }
}
```

#### POST /api/documents/upload

Upload a new medical document with AI processing.

**Request Body (multipart/form-data):**
- `file`: The document file (PDF, DOCX, TXT, PNG, JPEG, JPG)
- `category`: Document category (Lab Reports, Prescriptions, Imaging, Other)
- `tags`: Comma-separated tags (optional)

**Example Request:**
```http
POST /api/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [binary file data]
category: Lab Reports
tags: blood,test,annual
```

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "_id": "doc_id_here",
    "filename": "blood_test.pdf",
    "category": "Lab Reports",
    "fileType": "application/pdf",
    "fileSize": 1048576,
    "tags": ["blood", "test", "annual"],
    "uploadDate": "2024-01-15T10:30:00Z",
    "aiProcessed": true,
    "labValuesCount": 15,
    "summary": "Blood test results showing normal ranges...",
    "userId": "user_id_here"
  }
}
```

#### GET /api/documents/[id]

Get a specific document by ID.

**Response:**
```json
{
  "document": {
    "_id": "doc_id_here",
    "filename": "blood_test.pdf",
    "category": "Lab Reports",
    "fileType": "application/pdf",
    "fileSize": 1048576,
    "tags": ["blood", "test", "annual"],
    "uploadDate": "2024-01-15T10:30:00Z",
    "aiProcessed": true,
    "labValuesCount": 15,
    "summary": "Blood test results showing normal ranges...",
    "userId": "user_id_here"
  }
}
```

#### PUT /api/documents/[id]

Update document metadata.

**Request Body:**
```json
{
  "category": "Lab Reports",
  "tags": ["blood", "test", "annual", "updated"]
}
```

**Response:**
```json
{
  "message": "Document updated successfully",
  "document": {
    "_id": "doc_id_here",
    "filename": "blood_test.pdf",
    "category": "Lab Reports",
    "tags": ["blood", "test", "annual", "updated"],
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### DELETE /api/documents/[id]

Delete a document.

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

#### GET /api/documents/[id]/download

Download or view a document.

**Query Parameters:**
- `token`: JWT token for authentication (alternative to Authorization header)

**Response:**
- File stream with appropriate Content-Type and Content-Disposition headers

### Lab Values

#### GET /api/lab-values

Fetch extracted lab values with document grouping.

**Query Parameters:**
- `documentId` (string): Filter by specific document
- `testName` (string): Filter by test name
- `status` (string): Filter by result status (normal, high, low, critical)

**Example Request:**
```http
GET /api/lab-values?status=high
Authorization: Bearer <token>
```

**Response:**
```json
{
  "labValues": [
    {
      "_id": "lab_value_id_here",
      "testName": "Hemoglobin",
      "value": 14.2,
      "unit": "g/dL",
      "referenceRange": "12.0-15.5",
      "status": "normal",
      "documentId": "doc_id_here",
      "documentName": "blood_test.pdf",
      "extractedDate": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "groupedByDocument": {
    "doc_id_here": {
      "documentName": "blood_test.pdf",
      "labValues": [...]
    }
  }
}
```

### Reminders

#### GET /api/reminders

Fetch user reminders with filtering.

**Query Parameters:**
- `status` (string): Filter by status (pending, completed, overdue, cancelled)
- `type` (string): Filter by type (medicine, appointment, health_check, vaccination, screening, other)
- `category` (string): Filter by category (medication, appointment, maintenance, follow_up, preventive)
- `priority` (string): Filter by priority (low, medium, high, urgent)
- `upcoming` (boolean): Show only upcoming reminders

**Example Request:**
```http
GET /api/reminders?status=pending&priority=high
Authorization: Bearer <token>
```

**Response:**
```json
{
  "reminders": [
    {
      "_id": "reminder_id_here",
      "title": "Refill blood pressure medication",
      "description": "Need to refill amlodipine prescription",
      "type": "medicine",
      "category": "medication",
      "dueDate": "2024-01-20T00:00:00Z",
      "dueDateBS": "8 Magh 2080 BS",
      "reminderDate": "2024-01-15T00:00:00Z",
      "reminderDateBS": "3 Magh 2080 BS",
      "isRecurring": true,
      "recurrenceType": "monthly",
      "recurrenceInterval": 1,
      "medicationName": "Amlodipine",
      "dosage": "5mg",
      "frequency": "Once daily",
      "status": "pending",
      "priority": "high",
      "daysUntilDue": 5,
      "daysUntilReminder": 0,
      "shouldShowReminder": true,
      "isOverdue": false,
      "tags": ["important", "monthly"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

#### POST /api/reminders

Create a new reminder.

**Request Body:**
```json
{
  "title": "Refill blood pressure medication",
  "description": "Need to refill amlodipine prescription",
  "type": "medicine",
  "category": "medication",
  "dueDate": "2024-01-20T00:00:00Z",
  "isRecurring": true,
  "recurrenceType": "monthly",
  "recurrenceInterval": 1,
  "medicationName": "Amlodipine",
  "dosage": "5mg",
  "frequency": "Once daily",
  "priority": "high",
  "tags": ["important", "monthly"]
}
```

**Response:**
```json
{
  "message": "Reminder created successfully",
  "reminder": {
    "_id": "reminder_id_here",
    "title": "Refill blood pressure medication",
    "type": "medicine",
    "category": "medication",
    "dueDate": "2024-01-20T00:00:00Z",
    "dueDateBS": "8 Magh 2080 BS",
    "reminderDate": "2024-01-15T00:00:00Z",
    "reminderDateBS": "3 Magh 2080 BS",
    "status": "pending",
    "priority": "high"
  }
}
```

#### PUT /api/reminders/[id]

Update an existing reminder.

**Request Body:** Same as POST, but all fields are optional.

**Response:**
```json
{
  "message": "Reminder updated successfully",
  "reminder": {
    "_id": "reminder_id_here",
    "title": "Updated reminder title",
    "type": "medicine",
    "category": "medication",
    "dueDate": "2024-01-25T00:00:00Z",
    "status": "pending",
    "priority": "high"
  }
}
```

#### DELETE /api/reminders/[id]

Delete a reminder.

**Response:**
```json
{
  "message": "Reminder deleted successfully"
}
```

#### PUT /api/reminders/[id]/complete

Mark a reminder as completed.

**Response:**
```json
{
  "message": "Reminder marked as completed successfully",
  "reminder": {
    "_id": "reminder_id_here",
    "title": "Refill blood pressure medication",
    "status": "completed",
    "completedAt": "2024-01-15T10:00:00Z"
  }
}
```

## 📊 Data Models

### Document Model
```typescript
interface Document {
  _id: string;
  filename: string;
  category: 'Lab Reports' | 'Prescriptions' | 'Imaging' | 'Other';
  fileType: string;
  fileSize: number;
  tags: string[];
  uploadDate: Date;
  aiProcessed: boolean;
  labValuesCount?: number;
  summary?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Lab Value Model
```typescript
interface LabValue {
  _id: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  documentId: string;
  extractedDate: Date;
  createdAt: Date;
}
```

### Reminder Model
```typescript
interface Reminder {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'medicine' | 'appointment' | 'health_check' | 'vaccination' | 'screening' | 'other';
  category: 'medication' | 'appointment' | 'maintenance' | 'follow_up' | 'preventive';
  dueDate: Date;
  dueDateBS?: string;
  reminderDate: Date;
  reminderDateBS?: string;
  isRecurring: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  recurrenceInterval?: number;
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  doctorName?: string;
  location?: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔒 Error Handling

All API endpoints return consistent error responses:

### Error Response Format
```json
{
  "error": "Error message description",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Validation Errors
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

## 🚀 Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Document uploads**: 10 requests per hour
- **Other endpoints**: 100 requests per minute

## 📝 Pagination

For endpoints that return lists, pagination is supported:

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Response Headers:**
- `X-Total-Count`: Total number of items
- `X-Page-Count`: Total number of pages
- `X-Current-Page`: Current page number

## 🔍 Search and Filtering

### Text Search
- Searches across filename, tags, and extracted content
- Case-insensitive partial matching
- Multiple terms supported (space-separated)

### Date Filtering
- Use ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`
- Date ranges supported with `dateFrom` and `dateTo`

### Advanced Filtering
- Combine multiple filters for precise results
- Filters are applied with AND logic
- Empty or null filters are ignored

## 📱 WebSocket Support

Real-time updates for reminders and notifications:

```javascript
// Connect to WebSocket
const ws = new WebSocket('wss://your-domain.com/api/ws');

// Listen for reminder updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'reminder_update') {
    // Handle reminder update
  }
};
```

## 🧪 Testing

### Test Environment
- Base URL: `https://api.medilog.test`
- Test user credentials available in development setup
- Mock data endpoints for testing

### Postman Collection
Import the provided Postman collection for easy API testing:
- [MediLog API Collection](https://www.postman.com/collections/medilog-api)

## 📞 Support

For API support and questions:
- **Documentation**: This file and README.md
- **Issues**: [GitHub Issues](https://github.com/yourusername/medilog/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/medilog/discussions)

---

**API Version**: v1.0  
**Last Updated**: January 2024  
**Base URL**: `https://your-domain.com/api`

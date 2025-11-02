# Transplant Workflow Management System

A comprehensive, HIPAA-compliant web application for managing transplant organ coordination, reporting, and communication workflows.

## 🏥 Overview

This application provides end-to-end workflow management for transplant coordinators, surgeons, and healthcare teams involved in organ donation and transplantation. It features real-time collaboration, detailed analytics, preservation tracking, and comprehensive audit logging for regulatory compliance.

## ✨ Key Features

### Authentication & Authorization
- **Auth0 Integration**: Secure SSO authentication
- **Role-Based Access Control (RBAC)**: Granular permissions system
- **Persistent Sessions**: localStorage-based session management
- **Audit Trail**: Complete activity logging for HIPAA compliance

### Case Management
- **Donor Case Tracking**: Comprehensive donor information management
- **Multi-Organ Support**: Handle multiple organs per donor
- **Match ID System**: Track individual organ matches
- **Donor Summary Parser**: PDF parsing for donor documentation
- **Unified Dashboard**: Per-organ tabs for reporting, chat, transport, and analytics

### Reporting Forms
- Recovery Coordinator On-Call Record
- Thoracic Reporting Record (Heart & Lung)
- Liver Reporting Record
- Kidney Reporting Record
- Lung Reporting Record
- Pancreas Reporting Record
- **Responsive Design**: Mobile/tablet/desktop support
- **Dark Mode**: System-wide dark mode toggle
- **Auto-Submit**: Automatic backend submission with validation

### Collaboration Tools
- **Real-Time Chat**: Socket.IO-powered case discussions
- **File Uploads**: Attach images and documents
- **User Tagging**: Mention specific team members
- **Auto-Summaries**: System-generated updates for form submissions and events
- **Audit Timeline**: Complete action history per case

### Transport & Logistics
- **Transport Records**: Flight details and carrier information
- **Plane Tracking**: Integration with flight tracking APIs
- **Map Visualization**: Aircraft location display (Leaflet)
- **ETA Notifications**: Real-time arrival time updates
- **Analytics Integration**: Flight duration tracking

### Preservation & Ischemia Tracking
- **Preservation Segments**: Track COLD/WARM phases
- **Modality Support**: ICE, STATIC_COLD_ADV, HMP, NMP
- **Timeline Visualization**: Visual preservation timeline
- **Tolerance Profiles**: Admin-configurable time limits per organ/modality
- **Time Alerts**: Automated warnings when approaching time limits
- **Multi-Phase Support**: Handle multiple cold/warm cycles

### Analytics & Reporting
- **Ischemia Window Tracking**: Total cold and warm ischemia time
- **Perfusion History**: Track all modalities used
- **Transport Analytics**: Flight duration analysis
- **Preservation Scoring**: Quality metrics calculation
- **Risk Identification**: Automated risk factor detection
- **Export Capabilities**: CSV export for external analysis
- **Filtering**: By organ type, OPO, hospital, date range

### Coordinator Tools
- **Shift Start View**: Display unclaimed cases from previous shift
- **Case Handoff**: Transfer cases between coordinators
- **Assignment Management**: Coordinator assignment per organ match
- **Shift Notes**: Document shift activities and handoffs

### Physician/Surgeon Tools
- **Surgeon Notes**: Clinical notes per organ match
- **Private Notes**: Role-based visibility control
- **Read-Only Views**: Non-surgeon roles see limited information

### Admin Controls
- **Role Management**: Create and assign custom roles
- **Permission System**: Granular permission control
- **Workflow Templates**: Customizable workflow stages per organ type
- **User Management**: Activate/deactivate users, role assignment
- **System Configuration**: Editable system settings
- **Preservation Tolerances**: Configure time limits
- **Audit Log Viewer**: Complete system audit trail
- **Case Reassignment**: Admin override for coordinator assignment

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Auth0 + JWT
- **Real-Time**: Socket.IO
- **File Upload**: Multer
- **PDF Parsing**: pdf-parse
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

### Frontend Stack
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Authentication**: Auth0 React SDK
- **HTTP Client**: Axios
- **Real-Time**: Socket.IO Client
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Maps**: Leaflet + React Leaflet
- **Notifications**: React Hot Toast
- **UI Components**: Headless UI

### Security & Compliance
- **Data Encryption**: Crypto-js for sensitive data
- **HTTPS**: Enforced in production
- **HSTS**: HTTP Strict Transport Security
- **CSP**: Content Security Policy headers
- **Rate Limiting**: Per-IP request throttling
- **Audit Logging**: All actions logged with user, IP, timestamp
- **Session Management**: Secure token handling
- **RBAC**: Role-based data access restrictions

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Auth0 account (for authentication)

### Setup Guides

**Choose your platform**:
- **Windows 11**: See [SETUP_GUIDE_WINDOWS.md](./SETUP_GUIDE_WINDOWS.md) - Complete Windows-specific instructions
- **macOS/Linux**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Unix-based systems

Both guides include:
- Step-by-step installation
- Database configuration
- Auth0 setup
- Troubleshooting tips
- Platform-specific commands

### Quick Start

**Detailed setup instructions are in the platform-specific guides:**
- [Windows 11 Setup Guide](./SETUP_GUIDE_WINDOWS.md)
- [macOS/Linux Setup Guide](./SETUP_GUIDE.md)

**Quick Overview**:

#### Backend Setup

1. Navigate to backend directory
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Configure environment variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/transplant_db"

# Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# Flight Tracking (optional)
FLIGHT_API_KEY=your-flight-api-key
FLIGHT_API_URL=https://api.aviationstack.com/v1
```

5. Initialize database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

6. Start development server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
VITE_AUTH0_REDIRECT_URI=http://localhost:5173

VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

5. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🚀 Production Deployment

### Backend Deployment

1. Build the application:
```bash
cd backend
npm run build
```

2. Set production environment variables

3. Run database migrations:
```bash
npm run prisma:migrate
```

4. Start production server:
```bash
npm start
```

### Frontend Deployment

1. Build the application:
```bash
cd frontend
npm run build
```

2. The `dist/` folder contains the production-ready static files

3. Deploy to your preferred hosting:
   - **Vercel**: `vercel deploy`
   - **Netlify**: `netlify deploy --prod`
   - **AWS S3 + CloudFront**
   - **Nginx**: Serve the `dist/` folder

### Environment Setup

**Required Environment Variables:**

Backend:
- `DATABASE_URL`: PostgreSQL connection string
- `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`
- `ENCRYPTION_KEY`: 32-character encryption key
- `JWT_SECRET`: Secret for internal tokens
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Set to `production`

Frontend:
- `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`
- `VITE_API_URL`: Backend API URL
- `VITE_SOCKET_URL`: Socket.IO server URL

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE transplant_db;
```

2. Run Prisma migrations:
```bash
npx prisma migrate deploy
```

3. Seed initial data (optional):
```bash
npx prisma db seed
```

## 📖 API Documentation

### Authentication
All API endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Base URL
`http://localhost:5000/api`

### Key Endpoints

#### Cases
- `GET /cases` - List all cases
- `GET /cases/:id` - Get case details
- `POST /cases` - Create new case
- `PATCH /cases/:id` - Update case

#### Organ Matches
- `POST /organ-matches` - Create organ match
- `PATCH /organ-matches/:id` - Update match
- `POST /organ-matches/:id/assign` - Assign coordinator

#### Reporting
- `POST /reporting` - Submit report
- `GET /reporting/organ-match/:id` - Get reports for match
- `GET /reporting/type/:type` - Get reports by type

#### Chat
- `POST /chat/messages` - Send message
- `GET /chat/:caseId/messages` - Get case messages
- `POST /chat/upload` - Upload file

#### Transport
- `POST /transport` - Create transport record
- `PATCH /transport/:id` - Update transport
- `GET /transport/:id/track` - Track flight

#### Preservation
- `POST /preservation/segments` - Start preservation segment
- `PATCH /preservation/segments/:id/end` - End segment
- `GET /preservation/organ-match/:id` - Get segments
- `GET /preservation/tolerances` - Get tolerance limits

#### Analytics
- `GET /analytics/organ-match/:id` - Get match analytics
- `POST /analytics/organ-match/:id/calculate` - Recalculate
- `GET /analytics/aggregate` - Get aggregate data
- `GET /analytics/export` - Export CSV

#### Admin
- `GET /admin/audit-logs` - Get audit logs
- `GET /admin/users` - List users
- `PATCH /admin/users/:id/role` - Update user role
- `POST /admin/reassign-case` - Reassign case

## 🔐 Permissions System

### Available Permissions
- `view:cases` - View case list and details
- `create:cases` - Create new cases
- `update:cases` - Edit case information
- `view:reports` - View submitted reports
- `submit:reports` - Submit new reports
- `view:analytics` - View analytics dashboards
- `export:analytics` - Export data to CSV
- `manage:workflows` - Create/edit workflow templates
- `manage:transport` - Create/edit transport records
- `manage:preservation` - Start/end preservation segments
- `assign:coordinator` - Assign coordinators to cases
- `view:surgeon-notes` - View surgeon notes
- `create:surgeon-notes` - Create surgeon notes
- `admin:*` - Full admin access
- `*` - All permissions

### Default Roles
- **Admin**: Full system access (`*`)
- **Surgeon**: Clinical access (view cases, create notes)
- **Coordinator**: Case management (create/update cases, workflows, reports)
- **User**: Read-only access (view cases and reports)

## 🎨 UI Features

### Dark Mode
System-wide dark mode toggle in navigation bar. Preference saved to localStorage.

### Responsive Design
Fully responsive layout supporting:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)

### Real-Time Updates
- Live chat messages
- Transport ETA notifications
- Preservation time warnings
- Form submission alerts
- Case status changes

## 📊 Database Schema

### Core Models
- **User**: User accounts with roles
- **Role**: Permission-based roles
- **DonorCase**: Donor information
- **OrganMatch**: Individual organ matches
- **ReportingRecord**: Submitted forms
- **ChatMessage**: Case communications
- **TransportRecord**: Flight information
- **PreservationSegment**: Ischemia tracking
- **OrganAnalytics**: Calculated metrics
- **AuditLog**: Complete audit trail

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
1. Check the documentation
2. Review existing issues on GitHub
3. Create a new issue with detailed description

## 🔒 HIPAA Compliance Checklist

- [x] Encrypted data storage
- [x] Secure authentication (Auth0)
- [x] Complete audit logging
- [x] Role-based access control
- [x] Session timeout handling
- [x] Data retention policies
- [x] Secure API endpoints
- [x] HTTPS enforcement
- [x] IP tracking
- [x] User activity monitoring
- [x] Data export controls
- [x] Access revocation capabilities

## 📅 Roadmap

### Phase 1 (Current)
- [x] Core case management
- [x] Reporting forms
- [x] Real-time chat
- [x] Basic analytics
- [x] Admin panel

### Phase 2 (Planned)
- [ ] Advanced workflow automation
- [ ] Mobile applications (iOS/Android)
- [ ] Enhanced analytics dashboards
- [ ] Integration with hospital EHR systems
- [ ] Automated report generation
- [ ] Machine learning for risk prediction

### Phase 3 (Future)
- [ ] Multi-language support
- [ ] Advanced data visualization
- [ ] Predictive analytics
- [ ] Integration with UNOS
- [ ] Telemedicine features

## 👥 Team

Built for healthcare professionals dedicated to saving lives through organ transplantation.

---

**Version**: 1.0.0
**Last Updated**: 2025-11-02

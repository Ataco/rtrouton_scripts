# Quick Setup Guide

## Initial Setup (5 minutes)

### 1. Auth0 Configuration

1. Create Auth0 account at https://auth0.com
2. Create a new Application (Single Page Application)
3. Create a new API
4. Note down:
   - Domain (e.g., `your-tenant.auth0.com`)
   - Client ID
   - Audience (API Identifier)

### 2. Database Setup

```bash
# Install PostgreSQL (if not already installed)
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql
sudo service postgresql start

# Create database
createdb transplant_db
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
# Required:
# - DATABASE_URL
# - AUTH0_* variables
# - ENCRYPTION_KEY (generate with: openssl rand -base64 32)

# Create logs directory
mkdir -p logs

# Create uploads directory
mkdir -p uploads

# Initialize database
npm run prisma:generate
npm run prisma:migrate

# Start server
npm run dev
```

Backend will be running at `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your Auth0 values
# Required:
# - VITE_AUTH0_DOMAIN
# - VITE_AUTH0_CLIENT_ID
# - VITE_AUTH0_AUDIENCE

# Start development server
npm run dev
```

Frontend will be running at `http://localhost:5173`

### 5. Auth0 Application Settings

In your Auth0 Application settings:

**Allowed Callback URLs:**
```
http://localhost:5173, http://localhost:5173/callback
```

**Allowed Logout URLs:**
```
http://localhost:5173
```

**Allowed Web Origins:**
```
http://localhost:5173
```

**Allowed Origins (CORS):**
```
http://localhost:5173
```

### 6. Create Initial Admin User

1. Navigate to `http://localhost:5173`
2. Click "Sign In"
3. Complete Auth0 signup
4. First user will be created with default "User" role

To make yourself an admin:

```bash
# Connect to database
psql transplant_db

# Find your user ID
SELECT id, email FROM users;

# Create admin role (if doesn't exist)
INSERT INTO roles (id, name, description, permissions)
VALUES (gen_random_uuid(), 'Admin', 'Administrator with full access', '["*"]');

# Get admin role ID
SELECT id FROM roles WHERE name = 'Admin';

# Update your user to admin
UPDATE users SET "roleId" = '<admin-role-id>' WHERE email = 'your@email.com';
```

### 7. Verify Setup

1. Backend health check: `http://localhost:5000/health`
   - Should return `{ "status": "ok", "timestamp": "..." }`

2. Frontend: `http://localhost:5173`
   - Should show login page
   - After login, should show dashboard

3. Test Socket.IO connection:
   - Open browser console
   - Should see "Socket connected" message

## Common Issues

### Database Connection Failed
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Ensure database exists: `psql -l`

### Auth0 Login Error
- Verify all Auth0 URLs in Application settings
- Check .env variables match Auth0 dashboard
- Clear browser cache and localStorage

### CORS Errors
- Verify CORS_ORIGIN in backend .env matches frontend URL
- Check Auth0 Allowed Origins includes frontend URL

### Socket.IO Not Connecting
- Check SOCKET_CORS_ORIGIN in backend .env
- Verify backend is running
- Check browser console for errors

## Production Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Use strong ENCRYPTION_KEY and JWT_SECRET
- [ ] Configure production DATABASE_URL
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure Auth0 production URLs
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Review security headers (Helmet)
- [ ] Set up CDN for frontend static files
- [ ] Configure file upload limits
- [ ] Enable database connection pooling
- [ ] Set up error tracking (e.g., Sentry)

## Next Steps

1. **Configure Preservation Tolerances**: Go to Admin > System Config
2. **Create Roles**: Go to Admin > Roles to create custom roles
3. **Invite Users**: Share application URL with team members
4. **Create Workflow Templates**: Set up organ-specific workflows
5. **Test Case Creation**: Create a test donor case
6. **Review Audit Logs**: Verify all actions are being logged

## Development Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run prisma:studio # Open Prisma Studio (database GUI)
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Auth0 Documentation](https://auth0.com/docs)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [Socket.IO Documentation](https://socket.io/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## Support

For questions or issues:
1. Check this guide
2. Review README.md
3. Check application logs (backend/logs/)
4. Open an issue on GitHub

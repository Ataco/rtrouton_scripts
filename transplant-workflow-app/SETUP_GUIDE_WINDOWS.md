# Quick Setup Guide - Windows 11

## Initial Setup (5 minutes)

### Prerequisites

Before starting, ensure you have installed:
- **Node.js 18+** - Download from https://nodejs.org/
- **Git for Windows** - Download from https://git-scm.com/download/win
- **PostgreSQL 14+** - Download from https://www.postgresql.org/download/windows/

### 1. Auth0 Configuration

1. Create Auth0 account at https://auth0.com
2. Create a new Application (Single Page Application)
3. Create a new API
4. Note down:
   - Domain (e.g., `your-tenant.auth0.com`)
   - Client ID
   - Audience (API Identifier)

### 2. Database Setup

#### Install PostgreSQL on Windows 11

1. **Download PostgreSQL**:
   - Visit https://www.postgresql.org/download/windows/
   - Download the installer (recommended: EnterpriseDB installer)
   - Run the installer

2. **During Installation**:
   - Set a password for the `postgres` superuser (remember this!)
   - Default port: 5432
   - Accept default locale
   - Complete installation

3. **Verify Installation**:
   Open PowerShell and run:
   ```powershell
   # Check if PostgreSQL is installed
   psql --version
   ```

4. **Create Database**:
   ```powershell
   # Open PowerShell as Administrator
   # Connect to PostgreSQL (enter your password when prompted)
   psql -U postgres

   # In the PostgreSQL prompt, create the database:
   CREATE DATABASE transplant_db;

   # Exit PostgreSQL
   \q
   ```

   **Alternative method using pgAdmin**:
   - Open pgAdmin 4 (installed with PostgreSQL)
   - Right-click "Databases"
   - Select "Create" > "Database"
   - Name: `transplant_db`
   - Click "Save"

### 3. Backend Setup

Open **PowerShell** or **Command Prompt**:

```powershell
# Navigate to the transplant-workflow-app directory
cd transplant-workflow-app\backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env with your values using Notepad
notepad .env
```

**Configure .env file**:
```env
# Update these values:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/transplant_db?schema=public"
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

**Generate encryption key** (in PowerShell):
```powershell
# Generate a random 32-character encryption key
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```
Copy the output and add to `.env`:
```env
ENCRYPTION_KEY=<paste-your-generated-key>
JWT_SECRET=<paste-another-generated-key>
```

**Create required directories**:
```powershell
# Create logs directory
mkdir logs

# Create uploads directory
mkdir uploads
```

**Initialize database**:
```powershell
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

**Start backend server**:
```powershell
npm run dev
```

Backend will be running at `http://localhost:5000`

**Keep this PowerShell window open!**

### 4. Frontend Setup

Open a **NEW PowerShell** or **Command Prompt** window:

```powershell
# Navigate to frontend directory
cd transplant-workflow-app\frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env with Notepad
notepad .env
```

**Configure frontend .env**:
```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
VITE_AUTH0_REDIRECT_URI=http://localhost:5173

VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

**Start frontend server**:
```powershell
npm run dev
```

Frontend will be running at `http://localhost:5173`

**Keep both PowerShell windows open!**

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

1. Navigate to `http://localhost:5173` in your browser
2. Click "Sign In"
3. Complete Auth0 signup
4. First user will be created with default "User" role

**To make yourself an admin**:

Open a **NEW PowerShell** window:

```powershell
# Connect to database (enter your postgres password when prompted)
psql -U postgres -d transplant_db

# In the PostgreSQL prompt:

# Find your user ID
SELECT id, email FROM users;

# Create admin role (if doesn't exist)
INSERT INTO roles (id, name, description, permissions)
VALUES (gen_random_uuid(), 'Admin', 'Administrator with full access', '["*"]');

# Get admin role ID
SELECT id FROM roles WHERE name = 'Admin';

# Update your user to admin (replace <admin-role-id> and your email)
UPDATE users SET "roleId" = '<admin-role-id>' WHERE email = 'your@email.com';

# Exit PostgreSQL
\q
```

### 7. Verify Setup

1. **Backend health check**: Open browser to `http://localhost:5000/health`
   - Should return `{ "status": "ok", "timestamp": "..." }`

2. **Frontend**: Open browser to `http://localhost:5173`
   - Should show login page
   - After login, should show dashboard

3. **Test Socket.IO connection**:
   - Open browser Developer Tools (F12)
   - Go to Console tab
   - Should see "Socket connected" message

## Common Issues (Windows 11)

### PostgreSQL Not Found / Command Not Recognized

**Problem**: `psql` command not recognized

**Solution**:
1. Add PostgreSQL to your PATH:
   - Open "Environment Variables" (search in Start Menu)
   - Under "System Variables", find "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\PostgreSQL\15\bin` (adjust version number)
   - Click "OK" on all dialogs
   - **Restart PowerShell**

### Database Connection Failed

**Problem**: Cannot connect to database

**Solutions**:
- Check PostgreSQL is running:
  - Open "Services" (search in Start Menu)
  - Find "postgresql-x64-15" (or your version)
  - Ensure Status is "Running"
  - If not, right-click and select "Start"

- Verify DATABASE_URL in `.env`:
  ```env
  DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/transplant_db?schema=public"
  ```
  Make sure YOUR_PASSWORD matches what you set during installation

- Test connection:
  ```powershell
  psql -U postgres -d transplant_db
  # If this works, your database is fine
  ```

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:
```powershell
# Find what's using the port
netstat -ano | findstr :5000

# Kill the process (replace <PID> with the number from above)
taskkill /F /PID <PID>

# Then restart your server
npm run dev
```

### Auth0 Login Error

**Solutions**:
- Verify all Auth0 URLs in Application settings
- Check `.env` variables match Auth0 dashboard exactly
- Clear browser cache:
  - Press `Ctrl + Shift + Delete`
  - Select "Cookies and other site data"
  - Select "Cached images and files"
  - Click "Clear data"
- Open browser in Incognito/Private mode to test

### CORS Errors

**Solutions**:
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL:
  ```env
  CORS_ORIGIN=http://localhost:5173
  ```
- Check Auth0 "Allowed Origins" includes `http://localhost:5173`
- Restart backend server after changing `.env`

### Socket.IO Not Connecting

**Solutions**:
- Check `SOCKET_CORS_ORIGIN` in backend `.env`:
  ```env
  SOCKET_CORS_ORIGIN=http://localhost:5173
  ```
- Verify backend is running (check PowerShell window)
- Check browser console (F12) for specific error messages
- Try disabling Windows Firewall temporarily to test

### npm install Fails

**Problem**: Errors during `npm install`

**Solutions**:
- Run PowerShell as Administrator
- Clear npm cache:
  ```powershell
  npm cache clean --force
  npm install
  ```
- If node-gyp errors occur:
  ```powershell
  npm install --global windows-build-tools
  npm install
  ```

### Prisma Migration Fails

**Problem**: Error running `npm run prisma:migrate`

**Solutions**:
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct in `.env`
- Try running manually:
  ```powershell
  npx prisma migrate dev --name init
  ```
- If tables exist, reset database:
  ```powershell
  npx prisma migrate reset
  ```

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Use strong ENCRYPTION_KEY and JWT_SECRET (32+ characters each)
- [ ] Configure production DATABASE_URL (cloud database)
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

### Backend (PowerShell)
```powershell
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run prisma:studio # Open Prisma Studio (database GUI)
```

### Frontend (PowerShell)
```powershell
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Useful Windows Commands

```powershell
# Check if Node.js is installed
node --version

# Check if npm is installed
npm --version

# Check if PostgreSQL is installed
psql --version

# List running processes on a port
netstat -ano | findstr :5000

# Open Windows Firewall settings
Start-Process ms-settings:network-firewall

# Open Environment Variables
rundll32.exe sysdm.cpl,EditEnvironmentVariables

# View running services
services.msc
```

## Windows-Specific Tips

1. **Run PowerShell as Administrator** for installation commands
2. **Keep PowerShell windows open** - closing them stops the servers
3. **Use Windows Terminal** (from Microsoft Store) for better experience
4. **Antivirus**: May need to add exception for `node.exe` and PostgreSQL
5. **Firewall**: First run may prompt to allow access - click "Allow"

## Additional Resources

- [Node.js Downloads](https://nodejs.org/)
- [PostgreSQL Windows Download](https://www.postgresql.org/download/windows/)
- [Windows Terminal](https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701)
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
3. Check application logs (`backend\logs\` folder)
4. Search for error message online
5. Open an issue on GitHub

## Quick Troubleshooting Checklist

- [ ] PostgreSQL service is running (check Services)
- [ ] Both backend and frontend servers are running (2 PowerShell windows)
- [ ] DATABASE_URL in `.env` has correct password
- [ ] Auth0 URLs are configured correctly
- [ ] No firewall blocking ports 5000 or 5173
- [ ] Browser is at `http://localhost:5173` (not https)
- [ ] Clear browser cache if login issues occur
- [ ] Check both PowerShell windows for error messages

---

**Platform**: Windows 11
**Last Updated**: 2025-11-02

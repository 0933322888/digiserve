# Admin Authentication Setup

The admin pages are now protected by authentication. This document explains how to set up and use the admin authentication system.

## Environment Variables

Create or update your `.env.local` file with the following variables:

```env
# Admin Authentication
AUTH_SECRET=your-very-secure-secret-key-here-change-this-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here

# Optional: If you want to use a hashed password instead of plain text
# Generate a hash using: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10).then(console.log);"
# ADMIN_PASSWORD_HASH=$2a$10$...
```

### Important Security Notes

1. **AUTH_SECRET**: This should be a long, random, secret string. In production, use a strong random key. You can generate one using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **ADMIN_PASSWORD**: 
   - For development, you can use a plain text password.
   - For production, it's recommended to use `ADMIN_PASSWORD_HASH` instead (see below).

3. **ADMIN_PASSWORD_HASH**: If you set this, the system will use the hashed password and ignore `ADMIN_PASSWORD`. To generate a hash:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10).then(h => console.log('ADMIN_PASSWORD_HASH=' + h));"
   ```

## Default Credentials (Development Only)

If no environment variables are set, the system uses these default credentials:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Warning**: Never use default credentials in production!

## How It Works

1. **Middleware Protection**: All `/admin/*` routes (except `/admin/login`) are protected by Next.js middleware.

2. **Session Management**: Authentication uses JWT tokens stored in HTTP-only cookies for security.

3. **Login Page**: Access the admin login page at `/admin/login`

4. **Auto-redirect**: Unauthenticated users attempting to access admin pages are automatically redirected to the login page.

5. **Logout**: Click the "Logout" button in the admin sidebar or header to end your session.

## API Protection

All `/api/admin/*` routes (except `/api/admin/auth/*`) are also protected and require valid authentication.

## Session Duration

Sessions are valid for 24 hours. After that, users will need to log in again.

## Changing Credentials

To change admin credentials:

1. Update the environment variables in `.env.local`
2. Restart the Next.js development server or redeploy your application
3. Log out and log back in with the new credentials

## Troubleshooting

### Can't log in
- Verify your environment variables are set correctly
- Check that `.env.local` is in the project root
- Restart your development server after changing environment variables

### Getting redirected to login repeatedly
- Clear your browser cookies for the site
- Verify the `AUTH_SECRET` matches between sessions
- Check browser console for errors

### Session expires too quickly
- Current session duration is 24 hours
- To change this, modify the expiration time in `lib/auth-service.js` (look for `setExpirationTime`)


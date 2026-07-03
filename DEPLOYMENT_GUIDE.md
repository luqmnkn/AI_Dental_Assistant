# Deployment Guide for AI Dental Assistance

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure all required environment variables are configured:

```
# Database
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require&channel_binding=require

# Authentication
JWT_SECRET=your-secret-key-here
AUTH_COOKIE_NAME=token (optional, defaults to 'token')

# Clerk Authentication (if using Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# VAPI Voice Assistant
NEXT_PUBLIC_VAPI_ASSISTANT_ID=...
NEXT_PUBLIC_VAPI_API_KEY=...
NEXT_PUBLIC_VAPI_PUBLIC_KEY=...

# Email Service
RESEND_API_KEY=re_...

# Admin Settings
ADMIN_EMAIL=your-email@example.com
```

### 2. Database Setup
- Ensure PostgreSQL database is running on Neon or your provider
- Run migrations: `npx prisma migrate deploy`
- Verify connection with: `npx prisma db push`

### 3. Build Verification
```bash
npm run build
```
Should complete with "✓ Compiled successfully"

### 4. Production Build Test
```bash
npm run build
npm start
```
Test the application at `http://localhost:3000`

## Deployment Platforms

### Vercel (Recommended for Next.js)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy with `git push`

### Railway / Render / Heroku
1. Install platform CLI
2. Create project
3. Set environment variables
4. Deploy with platform commands

## Post-Deployment Verification

- [ ] Homepage loads without errors
- [ ] Sign up flow works
- [ ] Sign in flow works  
- [ ] Appointment booking works
- [ ] Dashboard displays correctly
- [ ] Admin panel accessible
- [ ] Email notifications sent
- [ ] Voice features functional (if applicable)

## Monitoring

### Key Metrics to Monitor
- Database connection errors
- API response times
- Authentication failures
- Build times and sizes

### Logging
Check application logs for:
- Database connection issues
- Auth token errors
- API failures

## Common Issues

### Database Connection Error
**Error**: "Can't reach database server at..."
**Solution**: 
- Verify DATABASE_URL is correct
- Check database is running
- Ensure firewall rules allow connections
- Test locally with `npx prisma db push`

### Build Failures
**Error**: "Type error: Property X does not exist"
**Solution**:
- Run `npm run build` locally first
- Check TypeScript errors with `npm run lint`
- Update types if needed

### Authentication Issues
**Error**: "Invalid credentials" or "User not found"
**Solution**:
- Verify JWT_SECRET is consistent across deployments
- Check cookie settings in auth.ts
- Ensure users are created in database

## Performance Optimization

### Already Configured
- ✅ Image optimization with Unoptimized for dev
- ✅ API route caching with React Query
- ✅ Turbopack for faster builds
- ✅ Prisma Client generation

### Recommendations
1. Enable Static Generation for landing page
2. Use API route caching
3. Monitor database query performance
4. Implement CDN for static assets

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] API keys stored as environment variables
- [ ] CORS properly configured
- [ ] HTTPS enforced in production
- [ ] Sensitive routes protected with auth
- [ ] Input validation on all forms
- [ ] Error messages don't leak sensitive info

## Scaling Considerations

### Database
- Monitor connection pool usage
- Consider Prisma Accelerate for edge
- Use read replicas for high traffic

### Application
- Enable Vercel Edge Functions for APIs
- Use Incremental Static Regeneration (ISR)
- Implement rate limiting on public APIs

## Support & Troubleshooting

### Check Logs
- Vercel: Dashboard → Deployments → Logs
- Railway: Dashboard → Logs
- Local: Terminal output during `npm start`

### Database Debugging
```bash
npx prisma studio  # Visual database browser
npx prisma migrate status  # Check migration status
```

### Build Debugging
```bash
npm run build  # Full build with type checking
npm run lint   # TypeScript and code quality checks
```

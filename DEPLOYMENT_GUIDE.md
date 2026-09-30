# LabCore ELIS - Hospital/Lab Deployment Guide

## 🔒 Security & Data Privacy Features

This Laboratory Information System (LIS) is designed for hospitals and laboratories with enterprise-grade security features to ensure:

- **Permanent data storage** with automatic backups
- **No data leaks** through encryption and access controls
- **Lifetime data preservation** with retention policies
- **HIPAA/GDPR compliance** for healthcare data protection
- **Secure email communications** for reports and notifications

---

## 🚀 Quick Deployment Steps

### 1. Prerequisites

- **Database**: PostgreSQL 14+ (recommended for production)
- **Node.js**: v18+ 
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: Minimum 50GB (scalable based on data volume)
- **Operating System**: Linux (Ubuntu 20.04+ recommended) or Windows Server

### 2. Environment Configuration

Copy and configure the `.env` file:

```bash
cd backend
cp .env.example .env
```

**Critical Security Settings:**

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/labcore_elis"

# JWT Security (generate strong secrets)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
JWT_ISSUER=labcore-api
JWT_AUDIENCE=labcore-web

# Data Encryption (CRITICAL for PHI protection)
ENCRYPTION_SECRET=your-super-secret-encryption-key-at-least-32-characters-long

# Backup Configuration
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE_ENABLED=true
BACKUP_SCHEDULE_CRON=0 2 * * *  # Daily at 2 AM

# Email Configuration (for secure report delivery)
EMAIL_PROVIDER=smtp
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
EMAIL_FROM_EMAIL=noreply@hospital.com
EMAIL_FROM_NAME=Hospital Lab System

# Data Retention (HIPAA compliance)
DATA_RETENTION_YEARS=7
```

### 3. Database Setup

```bash
# Install PostgreSQL (Ubuntu)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE labcore_elis;
CREATE USER labcore_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE labcore_elis TO labcore_user;
\q
```

### 4. Application Installation

```bash
# Backend setup
cd backend
npm install
npx prisma generate
npx prisma migrate deploy

# Frontend setup
cd ../frontend
npm install
npm run build
```

### 5. Create Admin User

```bash
cd backend
npm run create-admin-ts
```

Follow the prompts to create the initial administrator account.

### 6. Start Services

**Development:**
```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm run dev
```

**Production (using PM2):**
```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start npm --name "labcore-api" -- run start

# Start frontend
cd frontend
pm2 start npm --name "labcore-web" -- run start

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## 🔐 Security Features Implementation

### 1. Data Encryption

The system implements AES-256-GCM encryption for:

- **Email credentials** and API keys in database
- **Backup files** (automatic encryption)
- **Sensitive patient data** (configurable)

**Encryption Key Management:**
- Store `ENCRYPTION_SECRET` in environment variables (never in code)
- Rotate encryption keys every 90 days
- Use key management services (KMS) in production

### 2. Backup & Recovery

**Automated Backups:**
- Daily encrypted database backups
- Configurable retention period (default: 30 days)
- Automatic cleanup of old backups

**Manual Backup Commands:**
```bash
# Create backup via API
POST /api/backups
Authorization: Bearer <admin-token>

# List backups
GET /api/backups
Authorization: Bearer <admin-token>

# Restore from backup
POST /api/backups/restore/:fileName
Authorization: Bearer <admin-token>
```

### 3. Access Control

**Role-Based Access Control (RBAC):**
- **ADMIN**: Full system access
- **FRONT_DESK**: Patient registration, orders
- **LAB_TECH**: Sample processing, result entry
- **PATHOLOGIST**: Result verification, approval
- **DOCTOR**: View reports, patient data

**Authentication:**
- JWT-based authentication with secure tokens
- Password hashing with bcrypt (12 rounds)
- Session timeout (30 minutes inactive)
- Failed login attempt tracking

### 4. Audit Logging

All PHI (Protected Health Information) access is logged:

- User authentication events
- Patient data access/modification
- System configuration changes
- Data exports and transfers
- Security incidents

**Audit Log Review:**
```bash
# View audit logs via API
GET /api/audit
Authorization: Bearer <admin-token>
```

### 5. Email Security

**Secure Email Delivery:**
- TLS/SSL encryption for email transmission
- Configurable SMTP providers
- Email delivery tracking and logging
- Template-based notifications

**Supported Email Providers:**
- SendGrid
- Mailgun
- AWS SES
- Custom SMTP

---

## 🏥 HIPAA/GDPR Compliance

### HIPAA Security Rule Implementation

1. **Administrative Safeguards**
   - Security management process
   - Assigned security responsibility
   - Workforce security training
   - Information access management

2. **Physical Safeguards**
   - Facility access controls
   - Workstation security
   - Device and media controls

3. **Technical Safeguards**
   - Access control (authentication, authorization)
   - Audit controls
   - Integrity controls
   - Transmission security

### GDPR Compliance Features

1. **Data Subject Rights**
   - Right to access (data export)
   - Right to rectification
   - Right to erasure (anonymization)
   - Right to data portability

2. **Data Protection**
   - Encryption at rest and in transit
   - Pseudonymization where applicable
   - Data minimization principles
   - Privacy by design

---

## 📧 Email Configuration for Reports

### SMTP Setup (Recommended for Hospitals)

**Gmail SMTP:**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-hospital@gmail.com
SMTP_PASSWORD=your-app-specific-password
EMAIL_FROM_EMAIL=reports@hospital.com
EMAIL_FROM_NAME=Hospital Laboratory
```

**Office 365 SMTP:**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=reports@hospital.com
SMTP_PASSWORD=your-password
EMAIL_FROM_EMAIL=reports@hospital.com
EMAIL_FROM_NAME=Hospital Laboratory
```

**Custom SMTP Server:**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=mail.hospital.com
SMTP_PORT=587
SMTP_USER=lab-system@hospital.com
SMTP_PASSWORD=secure-password
EMAIL_FROM_EMAIL=lab-system@hospital.com
EMAIL_FROM_NAME=Hospital Laboratory
```

### Email Templates

The system includes configurable email templates for:

- Patient registration confirmations
- Sample collection reminders
- Result delivery notifications
- Invoice notifications
- Appointment reminders

---

## 🔄 Data Backup Strategy

### 3-2-1 Backup Rule

**3 copies of data:**
1. Primary database
2. Local encrypted backup
3. Remote cloud backup

**2 different storage types:**
- Local server storage
- Cloud storage (AWS S3, Google Cloud Storage)

**1 off-site backup:**
- Cloud backup for disaster recovery

### Automated Backup Schedule

```env
# Daily backups at 2 AM
BACKUP_SCHEDULE_CRON=0 2 * * *

# Weekly full backup + daily incremental
BACKUP_SCHEDULE_CRON=0 2 * * 0  # Full backup on Sunday
```

### Backup Verification

Regular backup restoration testing:
```bash
# Test backup restoration
npm run test-backup-restore
```

---

## 🚨 Security Best Practices

### 1. Network Security

- Use HTTPS/TLS for all connections
- Implement firewall rules
- Use VPN for remote access
- Regular security updates

### 2. Database Security

- Strong database passwords
- Limited database user permissions
- Regular database updates
- Encrypted database connections

### 3. Application Security

- Regular dependency updates
- Security scanning
- Code review processes
- Penetration testing

### 4. Monitoring & Alerting

- System performance monitoring
- Security event logging
- Automated alerting
- Regular log review

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Generate secure JWT_SECRET (32+ characters)
- [ ] Generate secure ENCRYPTION_SECRET (32+ characters)
- [ ] Configure secure database credentials
- [ ] Set up email provider (SMTP)
- [ ] Configure backup directory and schedule
- [ ] Set data retention policy
- [ ] Configure firewall rules
- [ ] Obtain SSL certificate

### Post-Deployment

- [ ] Test authentication system
- [ ] Test email delivery
- [ ] Test backup creation
- [ ] Test backup restoration
- [ ] Verify audit logging
- [ ] Test role-based access control
- [ ] Configure monitoring alerts
- [ ] Train staff on security procedures

### Ongoing Maintenance

- [ ] Weekly backup verification
- [ ] Monthly security updates
- [ ] Quarterly access review
- [ ] Annual penetration testing
- [ ] Regular staff training
- [ ] Policy review and updates

---

## 🆘 Troubleshooting

### Email Not Sending

1. Check SMTP credentials in `.env`
2. Verify SMTP server accessibility
3. Check email provider API limits
4. Review communication logs in database

### Backup Failing

1. Verify database connection
2. Check backup directory permissions
3. Ensure sufficient disk space
4. Review encryption secret configuration

### Authentication Issues

1. Verify JWT_SECRET is configured
2. Check user account status (ACTIVE)
3. Review token expiration settings
4. Check system time synchronization

---

## 📞 Support

For deployment assistance or security concerns:

- **Documentation**: Check inline code comments
- **Audit Logs**: Review `/api/audit` endpoint
- **System Health**: Check `/health` endpoint
- **Error Logs**: Review application logs

---

## ⚠️ Important Security Notes

1. **Never commit `.env` files** to version control
2. **Rotate secrets regularly** (every 90 days)
3. **Use strong passwords** (minimum 12 characters)
4. **Enable 2FA** where possible
5. **Regular security audits** are essential
6. **Compliance requirements** vary by region
7. **Backup encryption** is mandatory for PHI
8. **Access logging** must never be disabled

---

This system is designed for healthcare environments where data security, privacy, and reliability are critical. Follow this guide carefully and consult with your organization's security team during deployment.
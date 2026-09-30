-- This script creates an initial admin user for LabCore ELIS
-- The password is hashed using bcrypt with 12 rounds
-- IMPORTANT: Set the password via environment variables or replace the hash below
-- Password placeholder - CHANGE THIS IN PRODUCTION!

-- First, let's check if an admin user already exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE email = 'admin@labcore.local' OR employeeCode = 'ADMIN001') THEN
        RAISE NOTICE 'Admin user already exists. Skipping creation.';
    ELSE
        -- Insert admin user with placeholder password
        -- REPLACE THE HASH BELOW WITH YOUR OWN BCRYPT HASH
        INSERT INTO users (
            id,
            employeeCode,
            fullName,
            email,
            phone,
            passwordHash,
            role,
            status,
            specialization,
            createdAt,
            updatedAt
        ) VALUES (
            'cm0admin001', -- Using a fixed ID for consistency
            'ADMIN001',
            'System Administrator',
            'admin@labcore.local',
            NULL,
            '$2b$12$REPLACE_WITH_YOUR_BCRYPT_HASH', -- REPLACE THIS WITH YOUR OWN HASH
            'ADMIN',
            'ACTIVE',
            'System Administration',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Admin user created successfully!';
        RAISE NOTICE 'Email: admin@labcore.local';
        RAISE NOTICE 'IMPORTANT: Generate your own bcrypt hash and replace the placeholder!';
    END IF;
END $$;

-- Display the created admin user
SELECT id, employeeCode, fullName, email, role, status, createdAt 
FROM users 
WHERE email = 'admin@labcore.local' OR employeeCode = 'ADMIN001';
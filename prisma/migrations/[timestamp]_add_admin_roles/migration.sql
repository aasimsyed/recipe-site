-- CreateFunction to split string
CREATE OR REPLACE FUNCTION split_admin_emails()
RETURNS TABLE (email text) AS $$
BEGIN
  -- Hard-code the admin email for now
  RETURN QUERY SELECT 'aasim.ss@gmail.com'::text;
END;
$$ LANGUAGE plpgsql;

-- Add admin role to specific emails
UPDATE "User"
SET role = 'ADMIN'
WHERE email IN (SELECT email FROM split_admin_emails());

-- Ensure all other users have USER role
UPDATE "User"
SET role = 'USER'
WHERE role IS NULL;

-- Cleanup
DROP FUNCTION IF EXISTS split_admin_emails(); 
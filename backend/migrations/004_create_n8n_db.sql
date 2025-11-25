-- Create database for n8n if not exists and grant privileges
DO
$$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'forgeflow_n8n') THEN
      PERFORM dblink_exec('dbname=postgres user=forgeflow password=forgeflow123 host=postgres', 'CREATE DATABASE forgeflow_n8n');
   END IF;
END
$$;

-- Ensure role/user exists (using existing forgeflow user)
-- Grant all privileges on database to forgeflow user
\connect forgeflow_n8n
GRANT ALL PRIVILEGES ON DATABASE forgeflow_n8n TO forgeflow;

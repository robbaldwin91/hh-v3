#!/usr/bin/env node
const { spawn, exec } = require('child_process');
const { Client } = require('pg');
const embeddedPostgres = require('embedded-postgres');
const path = require('path');
const fs = require('fs');

let pgInstance = null;
let nextProcess = null;

// Configuration
const DB_NAME = 'fruit_planner';
const DB_PORT = 5433; // Use a different port to avoid conflicts

async function createDatabaseIfNotExists(port, dbName) {
  // Connect to default postgres database first
  const client = new Client({
    host: 'localhost',
    port: port,
    database: 'postgres',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    await client.connect();
    
    // Check if database exists
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    
    if (result.rows.length === 0) {
      console.log(`Creating database "${dbName}"...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (error) {
    console.error('Error creating database:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function startDatabase() {
  console.log('Starting embedded PostgreSQL...');
  
  const config = {
    port: DB_PORT,
    database_dir: path.join(process.cwd(), '.postgres-data'),
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  };
  
  try {
    pgInstance = await embeddedPostgres.start(config);
    console.log(`PostgreSQL started on port ${DB_PORT}`);
    
    // Wait a moment for the server to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create the database
    await createDatabaseIfNotExists(DB_PORT, DB_NAME);
    
    return `postgresql://postgres:postgres@localhost:${DB_PORT}/${DB_NAME}`;
  } catch (error) {
    console.error('Failed to start PostgreSQL:', error);
    throw error;
  }
}

async function setupPrisma(databaseUrl) {
  console.log('Setting up Prisma...');
  
  // Set environment variable
  process.env.DATABASE_URL = databaseUrl;
  
  // Generate Prisma client
  await runCommand('npx', ['prisma', 'generate']);
  
  // Run migrations
  console.log('Running database migrations...');
  await runCommand('npx', ['prisma', 'migrate', 'dev', '--name', 'init']);
  
  console.log('Prisma setup complete!');
}

async function startNextDev() {
  console.log('Starting Next.js development server...');
  
  nextProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      DATABASE_URL: `postgresql://postgres:postgres@localhost:${DB_PORT}/${DB_NAME}`
    }
  });
  
  return new Promise((resolve) => {
    nextProcess.on('spawn', () => {
      console.log('Next.js development server started!');
      resolve();
    });
  });
}

async function cleanup() {
  console.log('\nShutting down...');
  
  if (nextProcess) {
    console.log('Stopping Next.js...');
    nextProcess.kill('SIGTERM');
  }
  
  if (pgInstance) {
    console.log('Stopping PostgreSQL...');
    try {
      await embeddedPostgres.stop();
      console.log('PostgreSQL stopped.');
    } catch (error) {
      console.error('Error stopping PostgreSQL:', error.message);
    }
  }
  
  process.exit(0);
}

async function main() {
  try {
    // Start embedded PostgreSQL
    const databaseUrl = await startDatabase();
    console.log(`Database URL: ${databaseUrl}`);
    
    // Setup Prisma with the database
    await setupPrisma(databaseUrl);
    
    // Start Next.js development server
    await startNextDev();
    
  } catch (error) {
    console.error('Error in development setup:', error);
    await cleanup();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error);
  await cleanup();
});

// Start the development environment
main().catch(async (error) => {
  console.error('Failed to start development environment:', error);
  await cleanup();
  process.exit(1);
});

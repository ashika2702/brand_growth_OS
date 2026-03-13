const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testConnection() {
  console.log('Testing Database Connection...');
  console.log('URL:', process.env.DATABASE_URL?.split('@')[1]); // Log host part
  
  try {
    const clients = await prisma.client.findMany({ take: 1 });
    console.log('✅ Connection Successful! Found', clients.length, 'clients.');
  } catch (error) {
    console.error('❌ Connection Failed!');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

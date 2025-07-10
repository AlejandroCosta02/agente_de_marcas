require('dotenv').config();
const { createClient } = require('@vercel/postgres');

async function testLeadsTable() {
  try {
    console.log('Testing leads table...');
    
    const client = createClient({
      connectionString: process.env.POSTGRES_URL_NON_POOLING
    });
    
    await client.connect();
    console.log('✅ Database connected successfully');
    
    // Check if leads table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'Lead'
      );
    `);
    
    console.log('Leads table exists:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Check table structure
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Lead'
        ORDER BY ordinal_position;
      `);
      
      console.log('Lead table columns:');
      columns.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type}`);
      });
      
      // Check leads count
      const leadsCount = await client.query('SELECT COUNT(*) FROM "Lead"');
      console.log('Number of leads in database:', leadsCount.rows[0].count);
    } else {
      console.log('❌ Leads table does not exist');
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLeadsTable(); 
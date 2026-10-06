import { sequelize } from './src/config/database';
import 'dotenv/config';
import Customer from './src/models/Customer';

async function checkCustomers() {
  try {
    await sequelize.authenticate();
    console.log('Connected');
    
    const customers = await Customer.findAll({ limit: 10 });
    console.log('Customers:', JSON.stringify(customers, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCustomers();
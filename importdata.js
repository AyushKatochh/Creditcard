const { PrismaClient } = require('@prisma/client');
const express = require('express');
const dateFns = require('date-fns');
const fs = require('fs');
const cors = require('cors'); // Add CORS for cross-origin requests if needed

require('dotenv').config();
const prisma = new PrismaClient();

const app = express();
const port = 3000; // Or any port you prefer

// Enable CORS (if needed)
app.use(cors());

// Middleware for JSON parsing
app.use(express.json());

app.get('/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany();
    res.json(customers); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /loans
app.get('/loans', async (req, res) => {
  try {
    const loans = await prisma.loan.findMany();
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function importData() {
  try {
    // Import customers data (with missing field handling)
    const customersCsv = fs.readFileSync('C:/Users/katoc/Downloads/credit-approval-system/credit-approval-system/data/customer_data.csv', 'utf8');
    const customersData = customersCsv.split('\n').slice(1).map((line) => {
      const [customer_id, first_name, last_name, age, phone_number, monthly_income, approved_limit, current_debt] = line.split(',');

      return {
        customerId: customer_id || undefined, 
        first_name: first_name || 'None',
        last_name: last_name || 'None',
        age: age ? parseInt(age) : null,
        phone_number: phone_number ? parseInt(phone_number) : null,
        monthly_income: monthly_income ? parseInt(monthly_income) : null,
        approved_limit: approved_limit ? parseInt(approved_limit) : null,
        current_debt: current_debt ? parseInt(current_debt) : null
      };
    });

    await prisma.customer.createMany({
      data: customersData,
      skipDuplicates: true,
    });

    // Import loans data 
    const loansCsv = fs.readFileSync('C:/Users/katoc/Downloads/credit-approval-system/credit-approval-system/data/loan_data.csv', 'utf8');

        const loansData = loansCsv.split('\n').slice(1).map((line) => {
            const [customer_id, loan_id, loan_amount, interest_rate, tenure, monthly_repayment, emis_paid_on_time, date_of_approval, end_date] = line.split(',');

            let formattedStartDate = null;
            let formattedEndDate = null;

            const dateFormats = ['M/d/yyyy', 'd/M/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'];

            // Validate and parse start_date
            if (!date_of_approval || typeof date_of_approval !== 'string') {
                console.error(`Invalid date_of_approval value: ${date_of_approval}. Skipping this row.`);
                return null; 
            } 
            for (const [index, format] of dateFormats.entries()) {
                const parsedDate = dateFns.parse(date_of_approval, format, new Date());
                if (dateFns.isValid(parsedDate)) {
                    formattedStartDate = parsedDate;
                    console.log(`[Row ${index + 1}] Successfully parsed start_date with format: ${format}`);
                    break; 
                } else {
                    console.error(`[Row ${index + 1}] Failed to parse start_date with format ${format}. Original value: ${date_of_approval}`);
                }
            }

            // Validate and parse end_date (similar logic) 
            if (!end_date || typeof end_date !== 'string') {
                console.error(`Invalid end_date value: ${end_date}. Skipping this row.`);
                return null; 
            } 
            for (const [index, format] of dateFormats.entries()) {
                // ... similar parsing for end_date ...
            }

            // Final Validation
            if (!formattedStartDate || !formattedEndDate) {
                console.error(`Invalid dates in CSV row: ${line}. Original values: date_of_approval = ${date_of_approval}, end_date = ${end_date}`);
                return null;
            }

            return {
                customer_id: customer_id ? parseInt(customer_id) : null,
                loan_id: loan_id ? parseInt(loan_id) : null, 
                loan_amount: parseFloat(loan_amount),
                interest_rate: parseFloat(interest_rate),
                tenure: parseInt(tenure),
                monthly_repayment: parseFloat(monthly_repayment),
                emis_paid_on_time: parseInt(emis_paid_on_time),
                start_date: formattedStartDate, 
                end_date: formattedEndDate, 
            };
        }).filter(Boolean); 

        await prisma.loan.createMany({
            data: loansData,
        });

console.log('Data imported successfully');

  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// POST /import
app.post('/import', async (req, res) => {
  try {
    await importData();
    res.json({ message: 'Data imported successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
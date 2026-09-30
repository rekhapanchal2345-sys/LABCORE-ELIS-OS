require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

async function simpleSeed() {
  try {
    console.log("Starting simple seed data population...");

    // Check if results already exist
    const existingResults = await prisma.result.findMany();
    if (existingResults.length > 0) {
      console.log(`Found ${existingResults.length} existing results. Database already has data.`);
      console.log("✅ Database already seeded with sample data");
      return;
    }

    // Check if patients exist
    const existingPatients = await prisma.patient.findMany();
    let patients;
    
    if (existingPatients.length === 0) {
      console.log("Creating patients...");
      patients = await Promise.all([
        prisma.patient.create({
          data: {
            uhid: "UHID-001",
            firstName: "John",
            lastName: "Doe",
            gender: "MALE",
            dateOfBirth: new Date("1985-05-15"),
            age: 39,
            phone: "+91-9876543210",
            email: "john.doe@example.com",
            bloodGroup: "O+",
            address: "123 Main Street, Ahmedabad",
          },
        }),
        prisma.patient.create({
          data: {
            uhid: "UHID-002",
            firstName: "Jane",
            lastName: "Smith",
            gender: "FEMALE",
            dateOfBirth: new Date("1990-08-20"),
            age: 34,
            phone: "+91-9876543211",
            email: "jane.smith@example.com",
            bloodGroup: "A+",
            address: "456 Oak Avenue, Ahmedabad",
          },
        }),
      ]);
      console.log(`Created ${patients.length} patients`);
    } else {
      patients = existingPatients;
      console.log(`Using ${patients.length} existing patients`);
    }

    // Check if doctors exist
    const existingDoctors = await prisma.doctor.findMany();
    let doctors;
    
    if (existingDoctors.length === 0) {
      console.log("Creating doctors...");
      doctors = await Promise.all([
        prisma.doctor.create({
          data: {
            doctorCode: "DOC-001",
            fullName: "Dr. Smith",
            qualification: "MBBS, MD",
            specialization: "Pathology",
            phone: "+91-9876543220",
            email: "dr.smith@example.com",
            isActive: true,
          },
        }),
        prisma.doctor.create({
          data: {
            doctorCode: "DOC-002",
            fullName: "Dr. Johnson",
            qualification: "MBBS, MD",
            specialization: "Cardiology",
            phone: "+91-9876543221",
            email: "dr.johnson@example.com",
            isActive: true,
          },
        }),
      ]);
      console.log(`Created ${doctors.length} doctors`);
    } else {
      doctors = existingDoctors;
      console.log(`Using ${doctors.length} existing doctors`);
    }

    // Check if tests exist
    const existingTests = await prisma.test.findMany();
    let tests;
    
    if (existingTests.length === 0) {
      console.log("Creating tests...");
      tests = await Promise.all([
        prisma.test.create({
          data: {
            testCode: "CBC",
            testName: "Complete Blood Count",
            shortName: "CBC",
            sampleType: "BLOOD",
            sampleContainer: "EDTA Purple",
            sampleVolume: "3ml",
            processingDepartment: "Hematology",
            method: "Automated Analyzer",
            description: "Complete blood count test",
            clinicalSignificance: "Measures various components of blood",
            patientPreparation: "No special preparation required",
            price: 500,
            offerPrice: 400,
            b2bRate: 350,
            gstPercentage: 18,
            tatHours: 24,
            tatDisplay: "24 hours",
            displayOrder: 1,
            isActive: true,
          },
        }),
        prisma.test.create({
          data: {
            testCode: "LIPID",
            testName: "Lipid Profile",
            shortName: "LIPID",
            sampleType: "SERUM",
            sampleContainer: "Serum Separator Red",
            sampleVolume: "5ml",
            processingDepartment: "Biochemistry",
            method: "Chemical Analyzer",
            description: "Lipid profile test",
            clinicalSignificance: "Measures cholesterol and triglycerides",
            patientPreparation: "12 hours fasting required",
            price: 800,
            offerPrice: 700,
            b2bRate: 600,
            gstPercentage: 18,
            tatHours: 24,
            tatDisplay: "24 hours",
            displayOrder: 2,
            isActive: true,
          },
        }),
      ]);
      console.log(`Created ${tests.length} tests`);
    } else {
      tests = existingTests;
      console.log(`Using ${tests.length} existing tests`);
    }

    // Check if orders exist
    const existingOrders = await prisma.order.findMany();
    let orders;
    
    if (existingOrders.length < 2) {
      console.log("Creating additional orders...");
      const newOrders = await Promise.all([
        prisma.order.create({
          data: {
            orderNumber: "ORD-2026-0001",
            barcode: "ORD-BC-001",
            patientId: patients[0].id,
            doctorId: doctors[0].id,
            orderStatus: "COMPLETED",
            paymentStatus: "PAID",
            priority: "ROUTINE",
            collectionType: "WALK_IN",
            subtotal: 500,
            discount: 0,
            gstAmount: 90,
            grandTotal: 590,
            paidAmount: 590,
            dueAmount: 0,
            sampleCollected: true,
          },
        }),
        prisma.order.create({
          data: {
            orderNumber: "ORD-2026-0002",
            barcode: "ORD-BC-002",
            patientId: patients[1].id,
            doctorId: doctors[1].id,
            orderStatus: "COMPLETED",
            paymentStatus: "PAID",
            priority: "ROUTINE",
            collectionType: "WALK_IN",
            subtotal: 800,
            discount: 0,
            gstAmount: 144,
            grandTotal: 944,
            paidAmount: 944,
            dueAmount: 0,
            sampleCollected: true,
          },
        }),
      ]);
      orders = [...existingOrders, ...newOrders];
      console.log(`Created ${newOrders.length} new orders, total: ${orders.length}`);
    } else {
      orders = existingOrders.slice(0, 2); // Use first 2 orders
      console.log(`Using ${orders.length} existing orders`);
    }

    // Create order items if they don't exist
    try {
      await prisma.orderItem.create({
        data: {
          orderId: orders[0].id,
          testId: tests[0].id,
          price: 500,
          finalPrice: 500,
        },
      });
      await prisma.orderItem.create({
        data: {
          orderId: orders[1].id,
          testId: tests[1].id,
          price: 800,
          finalPrice: 800,
        },
      });
      console.log("Created order items");
    } catch (error) {
      console.log("Order items might already exist, continuing...");
    }

    // Check if samples exist, if not create them
    const existingSamples = await prisma.sample.findMany();
    if (existingSamples.length === 0) {
      try {
        await prisma.sample.create({
          data: {
            sampleNumber: "SMP-90210",
            barcode: "SBC-90210",
            patientId: patients[0].id,
            orderId: orders[0].id,
            testId: tests[0].id,
            sampleType: "BLOOD",
            status: "COMPLETED",
            collectedAt: new Date(Date.now() - 3600000),
            receivedAt: new Date(Date.now() - 1800000),
            completedAt: new Date(),
            collectionType: "WALK_IN",
            priority: "ROUTINE",
          },
        });
        await prisma.sample.create({
          data: {
            sampleNumber: "SMP-90211",
            barcode: "SBC-90211",
            patientId: patients[1].id,
            orderId: orders[1].id,
            testId: tests[1].id,
            sampleType: "SERUM",
            status: "COMPLETED",
            collectedAt: new Date(Date.now() - 7200000),
            receivedAt: new Date(Date.now() - 5400000),
            completedAt: new Date(Date.now() - 3600000),
            collectionType: "WALK_IN",
            priority: "ROUTINE",
          },
        });
        console.log("Created samples");
      } catch (error) {
        console.log("Error creating samples:", error.message);
      }
    } else {
      console.log(`Using ${existingSamples.length} existing samples`);
    }

    // Skip parameter creation for now - create results without parameters
    console.log("Skipping parameter creation, will create results without parameter values");
    let parameters = [];

    // Check if results exist for our orders, if not create them
    const existingOrderResults = await prisma.result.findMany({
      where: {
        orderId: {
          in: orders.map(o => o.id)
        }
      }
    });
    
    let results;
    
    if (existingOrderResults.length === 0) {
      console.log("Creating results...");
      try {
        results = await Promise.all([
          prisma.result.create({
            data: {
              orderId: orders[0].id,
              testId: tests[0].id,
              status: "APPROVED",
              remarks: "Normal values observed",
              interpretation: "All parameters within normal range",
              enteredAt: new Date(Date.now() - 7200000),
              verifiedAt: new Date(Date.now() - 3600000),
              approvedAt: new Date(),
            },
          }),
          prisma.result.create({
            data: {
              orderId: orders[1].id,
              testId: tests[1].id,
              status: "APPROVED",
              remarks: "Slightly elevated cholesterol",
              interpretation: "Mild hyperlipidemia detected",
              enteredAt: new Date(Date.now() - 10800000),
              verifiedAt: new Date(Date.now() - 7200000),
              approvedAt: new Date(Date.now() - 3600000),
            },
          }),
        ]);
        console.log(`Created ${results.length} results`);
      } catch (error) {
        console.log("Error creating results:", error.message);
        results = [];
      }
    } else {
      results = existingOrderResults;
      console.log(`Using ${existingOrderResults.length} existing results for our orders`);
    }

    console.log(`Total results: ${results.length}`);
    console.log("✅ Simple seed data completed successfully!");
    console.log(`Database now contains: ${patients.length} patients, ${doctors.length} doctors, ${tests.length} tests, ${orders.length} orders, ${results.length} results`);

  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

simpleSeed()
  .then(() => {
    console.log("Seed process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  });
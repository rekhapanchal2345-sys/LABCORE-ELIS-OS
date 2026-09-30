import prisma from "../api/config/database";

async function seedData() {
  try {
    console.log("Starting seed data population...");

    // 1. Create Patients
    const patients = await Promise.all([
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
      prisma.patient.create({
        data: {
          uhid: "UHID-003",
          firstName: "Robert",
          lastName: "Williams",
          gender: "MALE",
          dateOfBirth: new Date("1978-12-10"),
          age: 45,
          phone: "+91-9876543212",
          email: "robert.williams@example.com",
          bloodGroup: "B+",
          address: "789 Pine Road, Ahmedabad",
        },
      }),
    ]);

    console.log(`Created ${patients.length} patients`);

    // 2. Create Doctors
    const doctors = await Promise.all([
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

    // 3. Create Tests
    const tests = await Promise.all([
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

    // 4. Create Categories and Parameters for tests
    const category = await prisma.testCategory.create({
      data: {
        code: "HEM",
        name: "Hematology",
        description: "Blood-related tests",
        department: "Hematology",
        color: "#EF4444",
        icon: "🩸",
        displayOrder: 1,
        isActive: true,
      },
    });

    const parameters = await Promise.all([
      prisma.testParameter.create({
        data: {
          testId: tests[0].id,
          parameterName: "Hemoglobin",
          shortName: "Hb",
          unit: "g/dL",
          dataType: "NUMERIC",
          displayOrder: 1,
          isRequired: true,
          isActive: true,
        },
      }),
      prisma.testParameter.create({
        data: {
          testId: tests[0].id,
          parameterName: "WBC Count",
          shortName: "WBC",
          unit: "x10^9/L",
          dataType: "NUMERIC",
          displayOrder: 2,
          isRequired: true,
          isActive: true,
        },
      }),
    ]);

    // Link category to test
    await prisma.test.update({
      where: { id: tests[0].id },
      data: {
        categoryId: category.id,
      },
    });

    console.log("Created categories and parameters");

    // 5. Create Orders
    const orders = await Promise.all([
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

    console.log(`Created ${orders.length} orders`);

    // 6. Create Order Items
    await Promise.all([
      prisma.orderItem.create({
        data: {
          orderId: orders[0].id,
          testId: tests[0].id,
          price: 500,
          finalPrice: 500,
        },
      }),
      prisma.orderItem.create({
        data: {
          orderId: orders[1].id,
          testId: tests[1].id,
          price: 800,
          finalPrice: 800,
        },
      }),
    ]);

    console.log("Created order items");

    // 7. Create Samples
    const samples = await Promise.all([
      prisma.sample.create({
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
      }),
      prisma.sample.create({
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
      }),
    ]);

    console.log(`Created ${samples.length} samples`);

    // 8. Create Results
    const results = await Promise.all([
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

    console.log("✅ Seed data completed successfully!");
    console.log(`Created: ${patients.length} patients, ${doctors.length} doctors, ${tests.length} tests, ${orders.length} orders, ${samples.length} samples, ${results.length} results`);

  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedData()
  .then(() => {
    console.log("Seed process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  });
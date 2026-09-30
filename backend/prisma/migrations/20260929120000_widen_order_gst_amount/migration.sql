-- orders.gstAmount was numeric(5,2), which overflows above 999.99 and made
-- patient-with-order registration fail for any order over ~5,555 INR at 18% GST.
ALTER TABLE "orders" ALTER COLUMN "gstAmount" TYPE NUMERIC(10, 2);

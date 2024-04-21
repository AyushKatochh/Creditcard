-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "customerId" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "age" INTEGER,
    "phone_number" BIGINT,
    "monthly_income" INTEGER,
    "approved_limit" INTEGER,
    "current_debt" INTEGER,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "loan_amount" DOUBLE PRECISION NOT NULL,
    "interest_rate" DOUBLE PRECISION NOT NULL,
    "tenure" INTEGER NOT NULL,
    "monthly_repayment" DOUBLE PRECISION NOT NULL,
    "emis_paid_on_time" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerId_key" ON "Customer"("customerId");

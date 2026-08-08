-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "studentCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classId" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "showScoreImmediately" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "testId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Choice" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "Choice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestAssignment" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "TestAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" INTEGER NOT NULL,
    "testId" TEXT NOT NULL,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentCode_key" ON "Student"("studentCode");

-- CreateIndex
CREATE INDEX "Student_classId_idx" ON "Student"("classId");

-- CreateIndex
CREATE INDEX "Question_testId_idx" ON "Question"("testId");

-- CreateIndex
CREATE INDEX "Choice_questionId_idx" ON "Choice"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "TestAssignment_testId_classId_key" ON "TestAssignment"("testId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "Attempt_studentId_testId_key" ON "Attempt"("studentId", "testId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAssignment" ADD CONSTRAINT "TestAssignment_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAssignment" ADD CONSTRAINT "TestAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

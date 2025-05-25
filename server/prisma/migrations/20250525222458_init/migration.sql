-- CreateTable
CREATE TABLE "Operators" (
    "operator_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'operator',
    "full_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operators_pkey" PRIMARY KEY ("operator_id")
);

-- CreateTable
CREATE TABLE "Templates" (
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "structure_definition" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "available_languages" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Templates_pkey" PRIMARY KEY ("template_id")
);

-- CreateTable
CREATE TABLE "Submissions" (
    "submission_id" TEXT NOT NULL,
    "fiscal_code" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'InProgress',
    "current_step_identifier" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "Submissions_pkey" PRIMARY KEY ("submission_id")
);

-- CreateTable
CREATE TABLE "Answers" (
    "answer_id" BIGSERIAL NOT NULL,
    "submission_id" TEXT NOT NULL,
    "question_identifier" TEXT NOT NULL,
    "answer_value" JSONB NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("answer_id")
);

-- CreateTable
CREATE TABLE "OperatorNotes" (
    "note_id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "question_identifier" TEXT,
    "operator_id" TEXT NOT NULL,
    "note_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperatorNotes_pkey" PRIMARY KEY ("note_id")
);

-- CreateTable
CREATE TABLE "FeedbackReports" (
    "feedback_id" TEXT NOT NULL,
    "submission_id" TEXT,
    "question_identifier" TEXT,
    "feedback_text" TEXT NOT NULL,
    "reporter_metadata" JSONB,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'New',

    CONSTRAINT "FeedbackReports_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Operators_email_key" ON "Operators"("email");

-- CreateIndex
CREATE INDEX "Templates_is_active_idx" ON "Templates"("is_active");

-- CreateIndex
CREATE INDEX "Submissions_fiscal_code_template_id_status_last_updated_at_idx" ON "Submissions"("fiscal_code", "template_id", "status", "last_updated_at" DESC);

-- CreateIndex
CREATE INDEX "Submissions_status_idx" ON "Submissions"("status");

-- CreateIndex
CREATE INDEX "Submissions_fiscal_code_idx" ON "Submissions"("fiscal_code");

-- CreateIndex
CREATE INDEX "Answers_submission_id_idx" ON "Answers"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "Answers_submission_id_question_identifier_key" ON "Answers"("submission_id", "question_identifier");

-- CreateIndex
CREATE INDEX "OperatorNotes_submission_id_idx" ON "OperatorNotes"("submission_id");

-- CreateIndex
CREATE INDEX "OperatorNotes_operator_id_idx" ON "OperatorNotes"("operator_id");

-- CreateIndex
CREATE INDEX "FeedbackReports_status_idx" ON "FeedbackReports"("status");

-- AddForeignKey
ALTER TABLE "Submissions" ADD CONSTRAINT "Submissions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "Templates"("template_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submissions"("submission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorNotes" ADD CONSTRAINT "OperatorNotes_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submissions"("submission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorNotes" ADD CONSTRAINT "OperatorNotes_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "Operators"("operator_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackReports" ADD CONSTRAINT "FeedbackReports_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submissions"("submission_id") ON DELETE SET NULL ON UPDATE CASCADE;

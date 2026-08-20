-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN "tokenAtivacao" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_tokenAtivacao_key" ON "Cliente"("tokenAtivacao");

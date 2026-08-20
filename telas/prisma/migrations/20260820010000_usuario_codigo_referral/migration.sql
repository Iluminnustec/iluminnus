-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "codigoReferral" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_codigoReferral_key" ON "Usuario"("codigoReferral");

-- AlterTable
ALTER TABLE "Despesa" ADD COLUMN     "dataReembolso" TIMESTAMP(3),
ADD COLUMN     "pagoPorSocioId" TEXT,
ADD COLUMN     "reembolsado" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Despesa" ADD CONSTRAINT "Despesa_pagoPorSocioId_fkey" FOREIGN KEY ("pagoPorSocioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "StatusDespesaIluminnus" AS ENUM ('PENDENTE', 'PAGO');

-- AlterTable
ALTER TABLE "Assinatura" ADD COLUMN     "trialAte" TIMESTAMP(3);

-- AlterTable: licenca entra nullable primeiro pra poder popular as linhas
-- que já existem, depois vira NOT NULL.
ALTER TABLE "Empresa" ADD COLUMN     "licenca" TEXT;

UPDATE "Empresa" SET "licenca" = 'TELAS-INIT-0001-' || UPPER(SUBSTRING(md5(random()::text || id), 1, 4))
WHERE "licenca" IS NULL;

ALTER TABLE "Empresa" ALTER COLUMN "licenca" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_licenca_key" ON "Empresa"("licenca");

-- CreateTable
CREATE TABLE "DespesaIluminnus" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "status" "StatusDespesaIluminnus" NOT NULL DEFAULT 'PENDENTE',
    "dataPagamento" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DespesaIluminnus_pkey" PRIMARY KEY ("id")
);

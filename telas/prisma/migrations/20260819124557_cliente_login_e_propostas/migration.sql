-- CreateEnum
CREATE TYPE "StatusProposta" AS ENUM ('PENDENTE', 'APROVADA', 'RECUSADA');

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "senhaHash" TEXT;

-- CreateTable
CREATE TABLE "Proposta" (
    "id" TEXT NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "status" "StatusProposta" NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clienteId" TEXT NOT NULL,

    CONSTRAINT "Proposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropostaItem" (
    "id" TEXT NOT NULL,
    "precoNoMomento" DOUBLE PRECISION NOT NULL,
    "propostaId" TEXT NOT NULL,
    "telaId" TEXT NOT NULL,

    CONSTRAINT "PropostaItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropostaItem" ADD CONSTRAINT "PropostaItem_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropostaItem" ADD CONSTRAINT "PropostaItem_telaId_fkey" FOREIGN KEY ("telaId") REFERENCES "Tela"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

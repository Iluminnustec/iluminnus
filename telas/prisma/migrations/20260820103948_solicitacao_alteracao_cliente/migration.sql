-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADA', 'RECUSADA');

-- CreateTable
CREATE TABLE "SolicitacaoAlteracaoCliente" (
    "id" TEXT NOT NULL,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "camposNovos" JSONB NOT NULL,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisadoEm" TIMESTAMP(3),
    "empresaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "revisadoPorId" TEXT,

    CONSTRAINT "SolicitacaoAlteracaoCliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SolicitacaoAlteracaoCliente_empresaId_idx" ON "SolicitacaoAlteracaoCliente"("empresaId");

-- AddForeignKey
ALTER TABLE "SolicitacaoAlteracaoCliente" ADD CONSTRAINT "SolicitacaoAlteracaoCliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoAlteracaoCliente" ADD CONSTRAINT "SolicitacaoAlteracaoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoAlteracaoCliente" ADD CONSTRAINT "SolicitacaoAlteracaoCliente_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoAlteracaoCliente" ADD CONSTRAINT "SolicitacaoAlteracaoCliente_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

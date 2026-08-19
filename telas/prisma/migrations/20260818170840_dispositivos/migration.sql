-- CreateTable
CREATE TABLE "Dispositivo" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "apelido" TEXT,
    "ultimoContato" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appVersao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "telaId" TEXT,

    CONSTRAINT "Dispositivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dispositivo_deviceId_key" ON "Dispositivo"("deviceId");

-- AddForeignKey
ALTER TABLE "Dispositivo" ADD CONSTRAINT "Dispositivo_telaId_fkey" FOREIGN KEY ("telaId") REFERENCES "Tela"("id") ON DELETE SET NULL ON UPDATE CASCADE;

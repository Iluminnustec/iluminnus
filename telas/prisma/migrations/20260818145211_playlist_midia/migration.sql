-- CreateEnum
CREATE TYPE "TipoMidia" AS ENUM ('IMAGEM', 'VIDEO');

-- AlterTable
ALTER TABLE "Tela" ADD COLUMN     "playlistId" TEXT,
ADD COLUMN     "rotacao" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "isPadrao" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Midia" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoMidia" NOT NULL,
    "url" TEXT NOT NULL,
    "caminhoStorage" TEXT NOT NULL,
    "duracaoSegundos" INTEGER NOT NULL DEFAULT 10,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playlistId" TEXT NOT NULL,
    "clienteId" TEXT,

    CONSTRAINT "Midia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tela" ADD CONSTRAINT "Tela_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Midia" ADD CONSTRAINT "Midia_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Midia" ADD CONSTRAINT "Midia_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

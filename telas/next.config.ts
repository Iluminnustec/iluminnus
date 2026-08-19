import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-right",
  },
  experimental: {
    serverActions: {
      // O Next só aceita Server Actions vindas de hosts que ele conhece.
      // Como o app responde em mais de um domínio (o próprio deploy da
      // Vercel + o subdomínio oficial admin.iluminnus.com.br), os dois
      // precisam estar liberados aqui, senão toda action (login incluso)
      // falha com erro 500 nos hosts extras.
      allowedOrigins: [
        "admin.iluminnus.com.br",
        "telas-blond.vercel.app",
        "*.vercel.app",
      ],
    },
  },
};

export default nextConfig;

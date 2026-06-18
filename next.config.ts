import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fijamos la raíz para evitar que Next infiera mal el workspace
  // (hay otro package-lock.json en el home del usuario).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("dist/memory", { recursive: true });
copyFileSync("src/memory/schema.sql", "dist/memory/schema.sql");

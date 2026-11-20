import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"],
  },
  {
    // RNF-07: el dominio no puede depender del framework, la base de datos ni la red.
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next", "next/*", "react", "react-dom"],
              message: "El dominio es independiente del framework.",
            },
            { group: ["@prisma/*", "stripe"], message: "El dominio no conoce la infraestructura." },
            {
              group: ["@/app/*", "@/infrastructure/*"],
              message: "El dominio no depende de capas externas.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;

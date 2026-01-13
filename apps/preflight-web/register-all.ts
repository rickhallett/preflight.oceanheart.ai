import { execSync } from "node:child_process";
import registry from "./aceternity-registry.json";

type ComponentRegistry = {
  name: string;
  type: string;
  dependencies?: string[];
  registryDependencies?: string[];
  devDependencies?: string[];
  files: {
    path: string;
    type: string;
  }[];
};

const getComponentRegistryURL = (component: string) =>
  `https://ui.aceternity.com/registry/${component}.json`;

const componentNames = registry.items.map(
  (item: ComponentRegistry) => item.name,
);

for (const componentName of componentNames) {
  // bunx --bun shadcn@latest add https://ui.aceternity.com/registry/\[component\].json
  const command = `bunx --bun shadcn@latest add ${getComponentRegistryURL(componentName)}`;

  try {
    execSync(command);
  } catch (error) {
    console.error(`Error registering component ${componentName}: ${error}`);
  }
}

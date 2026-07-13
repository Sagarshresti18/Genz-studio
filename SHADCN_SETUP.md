# Shadcn, Tailwind CSS, & TypeScript Setup Guide

This guide describes how to configure your project to use React, **shadcn/ui**, **Tailwind CSS**, and **TypeScript**, explaining the folder structures and best practices.

---

## 1. Setting up TypeScript

If starting a new project, initialize TypeScript to enable strong typing:

```bash
# Initialize TypeScript configuration
npx tsc --init
```

Ensure your `tsconfig.json` contains configurations appropriate for React/JSX compilation (under `compilerOptions`):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "preserve",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 2. Installing Tailwind CSS (v4)

Tailwind CSS v4 introduces high-performance compilation and native CSS-based configuration.

1. Install Tailwind CSS and its PostCSS integration:
   ```bash
   npm install tailwindcss @tailwindcss/postcss postcss autoprefixer
   ```
2. Create a `postcss.config.js` in the root:
   ```javascript
   module.exports = {
     plugins: {
       '@tailwindcss/postcss': {},
       autoprefixer: {},
     }
   }
   ```
3. Add Tailwind v4 to your global stylesheet (e.g., `globals.css` or `styles.scss`):
   ```css
   @import "tailwindcss";
   ```

---

## 3. Initializing Shadcn UI via CLI

Shadcn UI is a collection of re-usable components that you copy and paste into your apps. You can initialize it using its official CLI:

```bash
# Initialize shadcn/ui configuration in your project
npx shadcn@latest init
```

The CLI will prompt you with configuration choices:
1. **Style**: Default or New York
2. **Base Color**: Neutral, Slate, Zinc, etc.
3. **CSS Variables**: Yes/No (Allows support for Tailwind theme classes)
4. **Global CSS file path**: The path to your global stylesheet (e.g., `src/styles.scss` or `src/globals.css`)
5. **import alias for components**: `@/components` or `components/ui`
6. **import alias for utils**: `@/lib/utils`

This config generates a `components.json` file in the root which tracks your configurations and paths for UI components.

---

## 4. Path Configuration & Folder Structure

### Default Path for Components and Styles
Under the shadcn standard, components are grouped logically:
- `/components/ui/`: Contains modular, atomic base components (like `Button`, `Dialog`, `DropdownMenu`, etc.) that are direct dependencies of other sections.
- `/components/`: Contains higher-level layout components (like `Navbar`, `Sidebar`, `ScrollMorphHero`, etc.).
- `/lib/`: Contains shared utilities like `cn` (the `clsx` and `tailwind-merge` class merger function).

### Why `/components/ui/` is Crucial
1. **Automatic CLI Imports**: When you execute `npx shadcn@latest add button`, the CLI reads `components.json` and automatically downloads/updates the `button.tsx` code inside the `/components/ui/` directory. Changing or omitting this path breaks the CLI pipeline.
2. **Code Separation**: Separating atomic base elements (`/ui`) from feature-specific components (`/components`) prevents import clutter, namespace collisions, and dependency cycles.
3. **Uniformity**: Standardizing the directory to `/components/ui` lets developer tools, linters, and team members locate components instantly in large repositories.

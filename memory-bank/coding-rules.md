# Coding Rules

## Code Structure
1. **Component Organization**
   - Each component should be in its own file
   - Complex components can be split into smaller subcomponents
   - Keep component files under 250 lines of code when possible

2. **File Naming Conventions**
   - React components: PascalCase.tsx
   - Hooks: camelCase.ts
   - Contexts: PascalCaseContext.tsx
   - Utility functions: camelCase.ts

## Styling
1. **Use TailwindCSS**
   - Prefer Tailwind utility classes for styling
   - Follow mobile-first approach with responsive design

2. **3D Styling**
   - Keep materials and textures consistent with the overall visual style
   - Use the Three.js material system consistently

## State Management
1. **Component State**
   - Use React hooks (useState, useReducer) for component-level state
   - Extract complex state logic into custom hooks

2. **Global State**
   - Use React Context for global state that needs to be accessed by multiple components
   - Keep contexts focused on specific domains (e.g., MobileControlsContext)

3. **Configuration State**
   - Use Leva for debug controls and configuration
   - Group related controls together

## Performance Optimization
1. **React Optimizations**
   - Use React.memo for expensive components
   - Use useCallback for functions passed as props
   - Use useMemo for expensive calculations

2. **Three.js Optimizations**
   - Use instancing for repeated geometries
   - Optimize meshes and textures
   - Use appropriate level of detail for physics objects

## TypeScript Usage
1. **Type Safety**
   - Use TypeScript types for all props, state, and function parameters/returns
   - Avoid using 'any' type
   - Create interfaces for complex object structures

2. **Type Organization**
   - Define component prop types at the top of the file
   - Create shared types in separate files when used across multiple components

## Best Practices
1. **Code Comments**
   - Comment complex logic or non-obvious implementations
   - Use JSDoc style comments for functions and components

2. **Physics**
   - Keep physics objects simple
   - Use appropriate collision shapes
   - Fine-tune physics parameters for smooth interaction

3. **Shader Code**
   - Keep shader code in separate files
   - Comment shader code extensively
   - Use consistent naming for uniforms and attributes

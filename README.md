# 3D Physics Platformer

A modern 3D platformer game built with React, Three.js, and React Three Fiber, featuring physics-based gameplay, mobile support, and advanced visual effects.

![Game Screenshot](public/screenshot.png)

## Features

- **Responsive 3D Environment**: Play on both desktop and mobile devices
- **Physics-Based Gameplay**: Interact with dynamic objects using a realistic physics engine
- **Character Controls**: Smooth movement with running, jumping, and collision
- **Visual Effects**: Post-processing pipeline with bloom, chromatic aberration, vignette, and more
- **Mobile Support**: Touch controls optimized for mobile play
- **Customizable Settings**: Adjust graphics, controls, and game parameters

## Controls

### Desktop
- **WASD / Arrow Keys**: Movement
- **Space**: Jump
- **Shift**: Sprint

### Mobile
- **Virtual Joystick**: Movement (left side of screen)
- **Jump Button**: Jump (right side of screen)
- **Sprint Button**: Run faster (right side of screen)

## Tech Stack

- **React 18** + **TypeScript** for UI and logic
- **Three.js** + **React Three Fiber** for 3D rendering
- **React Three Rapier** for physics
- **TailwindCSS** for styling
- **Vite** for development and building

## Development

### Prerequisites
- Node.js 16+ and npm

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/3d-platformer.git

# Navigate to the project
cd 3d-platformer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

## Project Structure

- **src/**
  - **components/**: 3D objects and UI components
  - **contexts/**: React contexts for state management
  - **hooks/**: Custom React hooks
  - **schemas/**: Type definitions
  - **shaders/**: Custom GLSL shaders
  - **utils/**: Utility functions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The [React Three Fiber](https://github.com/pmndrs/react-three-fiber) community
- [Three.js](https://threejs.org/) for 3D rendering capabilities
- [React Three Rapier](https://github.com/pmndrs/react-three-rapier) for physics

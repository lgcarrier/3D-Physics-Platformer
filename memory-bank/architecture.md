# Architecture

## Component Structure
- **App.tsx**: Main application component that sets up the 3D environment, physics, lighting, and post-processing effects
- **Components/**: Reusable 3D and UI components
  - CharacterController: Character movement and physics
  - CharacterModel: Visual representation of the character
  - Ground: The physical ground plane
  - Balls: Interactive physics objects
  - FollowCamera: Camera that follows the character
  - MobileControls: Touch controls for mobile devices
  - Platforms: Platforms for character to navigate
  - Bridge: A bridge component
  - Building: Building structures

## State Management
- **Hooks/**: Custom React hooks for managing different aspects of the game
  - useCharacterControls: Character movement settings
  - useCameraControls: Camera behavior settings
  - useLightingControls: Light settings
  - usePostProcessingControls: Visual effects settings
  - useBridgeControls: Bridge behavior settings

- **Contexts/**: React contexts for global state
  - MobileControlsContext: State for mobile touch controls

## Rendering Pipeline
1. React Three Fiber Canvas setup
2. Environment and lighting configuration
3. Physics world initialization (React Three Rapier)
4. Game objects rendering (Character, Ground, Objects)
5. Camera positioning
6. Post-processing effects application

## Input Handling
- Keyboard input via KeyboardControls component
- Touch input via custom MobileControls component

## Visual Effects
- Various post-processing effects managed through EffectComposer:
  - Bloom
  - Chromatic Aberration
  - Vignette
  - Depth of Field
  - Brightness/Contrast
  - Hue/Saturation

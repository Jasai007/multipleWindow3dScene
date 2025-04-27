# Multiple Window 3D Scene with Three.js

## Overview

This project demonstrates a synchronized 3D visualization of multiple browser windows using Three.js and localStorage. Each browser window is represented as a sphere in a 3D scene, with small orbiting particles ("glittles") around it. The glittles follow the window movement with a trailing effect and interact with glittles of nearby windows, creating a dynamic effect reminiscent of a cell nucleus.

## What the Project Does

- Uses Three.js to render a 3D scene with spheres representing each open browser window.
- Manages multiple windows using a `WindowManager` class that tracks window positions and sizes, synchronizing state across windows via localStorage.
- Adds small particles ("glittles") orbiting each sphere, which follow the window movement smoothly.
- Implements interaction between glittles of nearby spheres, creating an attractive effect.
- Adjusts the scene offset based on the current window's screen position for a smooth visual effect.

## How It Works

1. **WindowManager**: Tracks all open windows, their positions, and sizes. It listens for changes in localStorage to synchronize window states across all windows and removes window data when a window closes.

2. **Three.js Scene**: Initialized with an orthographic camera and WebGL renderer. The scene contains spheres representing windows and glittles orbiting around them.

3. **Rendering Loop**: Continuously updates the positions and rotations of spheres and glittles based on window states and time. Glittles orbit their parent sphere with a lagging trailing effect.

4. **Glittle Interaction**: When two spheres come close, their glittles attract each other slightly, simulating interaction similar to a cell nucleus.

5. **Scene Offset**: The entire 3D scene is offset based on the current window's screen position to create a smooth movement effect.

## What We Achieved

- Replaced the original cubes with spheres to better represent windows.
- Added orbiting particles ("glittles") around each sphere with smooth trailing movement.
- Implemented interaction between glittles of nearby spheres.
- Fixed rendering issues related to camera setup and script loading.
- Resolved CORS issues by serving the project via a local HTTP server.
- Added error handling and debugging logs to identify and fix runtime errors.

## Problems Encountered and Solutions

- **CORS Policy Error**: Loading module scripts directly from the file system caused CORS errors. Solution: Serve the project using a local HTTP server (e.g., Python's `http.server`).

- **Camera Setup Issues**: Incorrect orthographic camera parameters caused a white screen. Solution: Corrected camera parameters and removed adding the camera to the scene.

- **Duplicate Imports**: Duplicate import statements caused syntax errors. Solution: Removed duplicate imports.

- **Vector3 Constructor Error**: Using an incorrect alias for `Vector3` caused runtime errors. Solution: Replaced all `t.Vector3` with `THREE.Vector3` and ensured correct referencing of the Three.js global.

- **General Debugging**: Added try-catch blocks and console logs to trace initialization and rendering steps.

## How to Run

1. Serve the project directory using a local HTTP server. For example, using Python:

   ```bash
   python -m http.server
   ```

2. Open your browser and navigate to:

   ```
   http://localhost:8000/index.html
   ```

3. Open multiple windows or tabs of the same page to see the synchronized 3D spheres and glittles representing each window.

## Dependencies

- [Three.js r124](https://threejs.org/) (included as `three.r124.min.js`)

## File Structure

- `index.html`: Entry point loading Three.js and main.js.
- `main.js`: Main script initializing the 3D scene, managing spheres and glittles, and rendering.
- `WindowManager.js`: Manages multiple browser windows and synchronizes their states via localStorage.
- `three.r124.min.js`: Three.js library.

---

This project showcases advanced web graphics and window management techniques by combining Three.js rendering with localStorage-based synchronization across multiple browser windows.

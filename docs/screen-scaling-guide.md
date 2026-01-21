# Screen Scaling Guide for Phaser 3

## Overview

The game is designed for 2560×1440 (2K) resolution but can scale to any browser/display size using Phaser's built-in scale manager.

## Current Configuration

```javascript
scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
}
```

## Available Scale Modes

### 1. FIT (Current - Recommended for Bar Display)
**Best for: Fixed displays, maintaining exact aspect ratio**

- ✅ Maintains 16:9 aspect ratio perfectly
- ✅ Scales game to fit browser window
- ✅ Centers game in viewport
- ⚠️ May show letterboxing (black bars) on non-16:9 screens
- 🎯 **Use case:** Bar TV display where aspect ratio matters more than filling screen

```javascript
scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
}
```

### 2. ENVELOP
**Best for: Filling screen completely, okay with cropping**

- ✅ Fills entire browser window
- ✅ Maintains aspect ratio
- ⚠️ May crop edges of game on non-16:9 screens
- 🎯 **Use case:** When you want no black bars and can afford to lose edge visibility

```javascript
scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH
}
```

### 3. RESIZE
**Best for: Dynamic layouts, responsive design**

- ✅ Canvas dynamically resizes to match browser
- ⚠️ Changes actual game dimensions (not just visual scale)
- ⚠️ Requires responsive game design (positions update on resize)
- 🎯 **Use case:** Web games that need to work on any screen size

```javascript
scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
}
```

### 4. EXPAND
**Best for: Filling available space**

- ✅ Expands to fill parent container
- ✅ Maintains aspect ratio
- 🎯 **Use case:** When parent container controls sizing

```javascript
scale: {
    mode: Phaser.Scale.EXPAND,
    autoCenter: Phaser.Scale.CENTER_BOTH
}
```

### 5. NONE
**Best for: Fixed size, no scaling**

- Canvas stays at exact SCREEN_WIDTH × SCREEN_HEIGHT
- No scaling or resizing
- 🎯 **Use case:** Development testing at exact resolution

```javascript
scale: {
    mode: Phaser.Scale.NONE
}
```

## Full-Screen Mode

To enable fullscreen (F11 or programmatic):

```javascript
scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'game-container' // Element to make fullscreen
}
```

Then trigger via code:

```javascript
// In a scene
this.scale.startFullscreen();

// Exit fullscreen
this.scale.stopFullscreen();

// Toggle
this.scale.toggleFullscreen();
```

## Responsive Parent Container

To make the game fill a responsive container:

```javascript
// In index.html
<div id="game-container" style="width: 100vw; height: 100vh;"></div>

// In config
scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-container',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT
}
```

## Handling Window Resize Events

Phaser automatically handles resize, but you can listen:

```javascript
// In a scene's create() method
this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
    console.log('Game resized:', displaySize.width, displaySize.height);

    // Update camera bounds if needed
    this.cameras.main.setBounds(0, 0, gameSize.width, gameSize.height);
});
```

## Bar Display Recommendations

For a 55"+ bar TV display:

### Option A: Fullscreen FIT (Recommended)
```javascript
scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'game-container'
}

// Then call this.scale.startFullscreen() when game starts
```

**Pros:**
- Perfect aspect ratio
- No distortion
- Professional appearance
- Works on any TV size

**Cons:**
- May have small letterboxing on non-16:9 TVs

### Option B: ENVELOP (Fill Screen)
```javascript
scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH
}
```

**Pros:**
- Fills entire screen
- No black bars

**Cons:**
- May crop edges on ultra-wide displays
- Players near edges might be cut off

## Pixel-Perfect Scaling

For crisp pixel art at integer scales:

```javascript
scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // Force integer scaling for pixel-perfect rendering
    zoom: 1  // Can use 2 for 2× integer scaling
}

// Also set in scene:
this.cameras.main.setRoundPixels(true);
```

## Testing Different Scales

To test how your game looks at different scales:

1. **Chrome DevTools**: F12 → Toggle Device Toolbar → Select different devices
2. **Resize Browser Window**: Manually resize to test FIT mode
3. **Zoom Browser**: Ctrl/Cmd + +/- to test zoom levels

## Current Setup Summary

```javascript
// src/main.js
const config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,   // 2560
    height: SCREEN_HEIGHT, // 1440
    scale: {
        mode: Phaser.Scale.FIT,        // Maintains aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH  // Centers in viewport
    }
};
```

**This means:**
- Game designed at 2560×1440
- Scales to fit any browser window
- Maintains 16:9 aspect ratio
- Centered on screen
- May show black bars on non-16:9 displays

## Changing the Scale Mode

To switch scale modes, edit `src/main.js`:

```javascript
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './systems/CoordinateSystem.js';

const config = {
    // ... other settings ...
    scale: {
        mode: Phaser.Scale.FIT,  // Change this to ENVELOP, RESIZE, etc.
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};
```

No other code changes needed - Phaser handles everything automatically!

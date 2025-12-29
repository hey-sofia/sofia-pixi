# sofia-pixi

This repo currently just serves as a little demo/experimentation lab for my [PixiJS](https://pixijs.com) work.

Normally I'd keep this sort of thing private, but the visual nature of this stuff + ease of sharing made me turn it into a live project instead. Sticking this in a live project will also make me more motivated to develop it further! 😅

Go to [pixi.sofia.bio](https://pixi.sofia.bio) to see it in action!

## status

Key - ✅ (Mostly) Complete | 🟡 Active/In-progress | 💀 Dead/Removed/Broken

| Feature             |     |
| ------------------- | --- |
| Collision detection | ✅  |
| Collision response  | ✅  |
| Out-of-bounds logic | 🟡  |

## todo

- Polish out-of-bounds logic (a bit janky atm)
- Menus + basic UI
- UI/Sprite size adapted for different screen sizes
- More sprites on-screen at once
- Ability for player to add sprites on-demand
  - Some customisation options would be cool too!
- Use sprite sheets instead of individual textures for sprites for improved efficiency
- Animated sprites
  - Facial expression/pose changes
  - Reactions to certain events e.g. colliding into things, idle, moving at supersonic speeds.
- Alternative modes of interaction
  - Buttons to trigger different effects
  - Keyboard input
  - Handling for custom events e.g. gyro, accelerometer, and anything else that isn't too invasive to listen for.
- Persistency
  - Probably via local storage initially, with view to move to something more robust when required for other things like...
- Real-time multiplayer
  - Likely via socket.io and a simple node service with sqlite that ensures connected clients are all synced and their states are persisted.
  - For persistence clients will need to auth with the server, but given this is just a silly browser game I'd like to keep things as lightweight and friction-less as possible. Maybe some kind of simple hash-based auth system could work?
- _[Stretch Goal]_ AR/XR features

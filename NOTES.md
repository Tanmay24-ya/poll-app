# Poll App Implementation Notes

## Architecture Overview
This is a real-time polling application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io for live updates.

## Fairness / Anti-Abuse Controls
As per the requirement to prevent repeat voting, two distinct mechanisms have been implemented:

1. **IP Address Tracking (Server-side)**
   - When a vote is cast, the server records the voter's IP address.
   - Subsequent vote attempts from the same IP for the same poll are rejected by the server (HTTP 403 Forbidden).
   - This provides a strong baseline defense against casual abuse.

2. **Local Storage Persistence (Client-side)**
   - Upon successful voting, a flag (`voted_<pollId>`) is stored in the browser's LocalStorage.
   - The UI checks this flag to disable voting buttons immediately, providing instant feedback and preventing accidental double-clicks.
   - While a savvy user could clear LocalStorage, the server-side IP check remains as the primary enforcement layer.

## Real-time Updates
- The app uses `socket.io` to broadcast vote changes instantly to all connected clients viewing the same poll.
- No page refresh is required to see new votes come in.

## Persistence
- All polls and votes are stored in a MongoDB database.
- Refreshing the page re-fetches the latest state from the database.

## UI/UX Improvements
- **Modern Dark Theme**: A sleek, dark-themed interface using CSS variables for consistency.
- **Glassmorphism**: Card-like containers with subtle transparency and shadows.
- **Animations**: Smooth transitions for progress bars and page load.
- **Responsiveness**: Fully responsive layout that works on desktop and mobile.

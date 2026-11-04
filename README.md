# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
---

# APU Smart Shuttle

## 1. Project Overview

APU Smart Shuttle is a web-based bus tracking and monitoring system designed for Asia Pacific University (APU) students.

The system helps students check shuttle bus schedules, select their pickup and destination stops, and track shuttle bus locations through a web browser.

Drivers can use a separate password-protected page to share their GPS locations with the system.

## 2. Main Features

- **Bus Timetable:** Students can view shuttle bus schedules.
- **Stop Selection:** Students can select their pickup and destination stops.
- **Live Bus Tracking:** Students can view the bus location on a map.
- **Estimated Arrival Time (ETA):** Students can check the estimated arrival time and distance.
- **Weather Information:** Weather conditions are considered when estimating arrival time.
- **Favourite Trips:** Students can save their frequently used trips.
- **Notifications:** Students receive reminders for their favourite trips.
- **Driver GPS Sharing:** Drivers can manually start and stop GPS location sharing.

## 3. Supported Shuttle Routes

| Bus ID | Shuttle Bus | Route |
|---|---|---|
| BUS001 | APU-BUS-01 | APU – LRT Bukit Jalil |
| BUS002 | APU-BUS-02 | APU – Parkhill |

## 4. System Workflow

### Driver Side

1. The driver opens the `/driver` page.
2. The driver enters the access code and selects a shuttle bus.
3. The driver taps **Start Tracking** and allows GPS access.
4. The smartphone sends location updates to Firebase Firestore.
5. The driver taps **Stop Tracking** when location sharing is no longer needed.

### Student Side

1. Students open the APU Smart Shuttle website.
2. Students select their pickup stop and destination.
3. The system displays the generated shuttle timetable.
4. Students select an available trip to open the live tracking map.
5. Students can view the bus

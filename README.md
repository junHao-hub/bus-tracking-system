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

## 5. System Architecture

The system follows a web-based architecture consisting of the frontend application, cloud database, and external services.

### Main Components

**1. Frontend – React and Vite**
- Provides the student dashboard, timetable, tracking map, notifications, and driver page.
- Accessible through mobile and desktop web browsers.

**2. Database – Firebase Firestore**
- Stores the current location information of each shuttle bus.
- Provides real-time data updates to student web pages.

**3. External Services**
- OpenStreetMap: Provides map display.
- Open-Meteo: Provides weather information for the Bukit Jalil area.
- OSRM: Used to generate road route lines.

**4. Hosting – Vercel**
- Hosts the web application.

### System Data Flow

The driver's smartphone obtains GPS location data and sends updates to Firebase Firestore. Student web pages receive the latest bus location from Firestore and display the bus position on the tracking map.

The application calculates the estimated arrival time and bus status based on the available location, speed, and distance information.

## 6. Technology Stack

| Technology | Purpose |
|---|---|
| React | Builds the web application user interface |
| Vite | Frontend development and build tool |
| Firebase Firestore | Stores and synchronises bus location data |
| GPS | Obtains the driver's location |
| OpenStreetMap | Provides map display |
| Open-Meteo | Provides weather information |
| OSRM | Generates road route lines |
| Vercel | Hosts the web application |

The project is a web application that can be accessed through mobile and desktop browsers.

## 7. Database Design

The project uses Firebase Firestore as its cloud database to store and synchronise shuttle bus location information.

### Bus Information

The system currently supports two shuttle buses:

| Bus ID | Bus Name | Route |
|---|---|---|
| BUS001 | APU-BUS-01 | APU – LRT Bukit Jalil |
| BUS002 | APU-BUS-02 | APU – Parkhill |

### Data Storage

- Current bus location information is stored in Firebase Firestore.
- Driver location updates are sent to the database.
- Student web pages receive real-time location updates.
- Bus location data is used to calculate distance, estimated arrival time (ETA), and bus status.

### Data Access and Security

- Student users can read bus location information.
- Only the authorised driver account can write bus location updates.
- Firestore security rules restrict the allowed bus IDs, fields, and statuses.
- Student favourites and notification history are stored locally in the student's browser instead of being uploaded to the server.

## 8. API & External Services

The application integrates with external services to support its main functions.

| Service | Purpose |
|---|---|
| Firebase Firestore | Stores and synchronises live bus location data |
| OpenStreetMap | Provides map information for the tracking interface |
| Open-Meteo | Provides weather information |
| OSRM | Used to generate road route line data |

### Data Integration

- The driver page sends GPS location updates to Firebase Firestore.
- Student pages receive bus location updates from Firestore.
- Weather information is retrieved from Open-Meteo.
- OpenStreetMap is used to display the map.
- OSRM was used to generate road route lines.

The current project documentation does not specify separate custom REST API endpoints.

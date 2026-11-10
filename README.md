# APU Smart Shuttle

Smarter Journeys, Less Waiting.

APU Smart Shuttle is a real time web app that helps APU students know when the campus shuttle leaves and where it is. Students choose a pickup stop and a destination, and the system finds the matching route automatically. Drivers share the bus location from their own smartphone.

**Live demo:** https://bus-tracking-system-nu.vercel.app/

---

## 1. Project Overview

Students who take the campus shuttle often wait at the stop without knowing when the next bus leaves, whether it is running, or where it is. Rain makes the delay worse. APU Smart Shuttle solves this with a simple website that needs no student login and no extra hardware. The driver's smartphone provides the GPS location, and the student page shows the timetable, the live bus position and the estimated arrival time.

## 2. Main Features

- Choose a pickup stop and a destination. The system finds the route automatically, and APU is always one of the two stops.
- Timetable with trip status. Each trip is Available or Upcoming, upcoming trips show a countdown, and finished trips are hidden.
- Heart button to save favourite trips.
- Reminders 10 minutes before the bus departs and 5 minutes before it arrives.
- Live tracking page, opened by tapping an Available trip, with the road route, stops, bus position, estimated arrival time, distance and bus status.
- Weather card. When it rains, the estimated arrival time is extended.
- Protected driver page for sharing the bus location from a smartphone.

## 3. Shuttle Routes

| Route | Stops | Bus | Bus ID |
|---|---|---|---|
| Route 1 | APU and LRT Bukit Jalil | APU-BUS-01 | BUS001 |
| Route 2 | APU and Parkhill | APU-BUS-02 | BUS002 |

Each route has one bus that runs in both directions.

---

## 4. System Workflow

### 4.1 Driver Side

1. The driver opens the `/driver` page.
2. The driver enters the access code and selects a shuttle bus.
3. The driver taps **Start Tracking** and allows GPS access.
4. The driver's smartphone sends location updates to Firebase Firestore.
5. The driver taps **Stop Tracking** when location sharing is no longer needed.

### 4.2 Student Side

1. Students open the APU Smart Shuttle website using a mobile or desktop browser.
2. Students select their pickup stop and destination.
3. The system generates and displays the shuttle timetable.
4. Students can mark trips as favourites and receive reminders.
5. Students select an available trip to open the live tracking map.
6. Students can view the bus location, estimated arrival time (ETA), distance, and bus status.

### 4.3 Data Flow

Driver's Smartphone (GPS) → Firebase Firestore → Student Web Application → Live Bus Tracking

---

## 5. System Architecture

The system follows a web-based architecture consisting of the frontend application, cloud database, and external services.

### 5.1 Main Components

**1. Frontend: React and Vite**

- Provides the student dashboard, timetable, tracking map, notifications, and driver page.
- Accessible through mobile and desktop web browsers.

**2. Database: Firebase Firestore**

- Stores the current location information of each shuttle bus.
- Provides real-time data updates to student web pages.

**3. External Services**

- **OpenStreetMap:** Provides map display.
- **Open-Meteo:** Provides weather information for the Bukit Jalil area.
- **OSRM:** Used to generate road route lines.

**4. Hosting: Vercel**

- Hosts the web application.

### 5.2 System Data Flow

The driver's smartphone obtains GPS location data and sends updates to Firebase Firestore. Student web pages receive the latest bus location from Firestore and display the bus position on the tracking map.

The application calculates the estimated arrival time and bus status based on the available location, speed, and distance information. When the weather shows rain, the estimated arrival time is increased.

---

## 6. Technology Stack

| Technology | Purpose |
|---|---|
| React | Builds the web application user interface |
| Vite | Frontend development and build tool |
| React Router | Handles page navigation |
| Leaflet | Displays the interactive map |
| Firebase Firestore | Stores and synchronises bus location data |
| Firebase Authentication | Protects the driver account |
| GPS (browser Geolocation) | Obtains the driver's location |
| OpenStreetMap | Provides map tiles |
| Open-Meteo | Provides weather information |
| OSRM | Generates road route lines |
| Vercel | Hosts the web application |

**Platform:** Web application accessible through mobile and desktop browsers.

---

## 7. Database Design

The project uses Firebase Firestore as its cloud database to store and synchronise shuttle bus location information.

### 7.1 Bus Information

The system currently supports two shuttle buses:

| Bus ID | Bus Name | Route |
|---|---|---|
| BUS001 | APU-BUS-01 | APU – LRT Bukit Jalil |
| BUS002 | APU-BUS-02 | APU – Parkhill |

### 7.2 Data Storage

- Current bus location information is stored in Firebase Firestore.
- Driver location updates are sent to the database.
- Student web pages receive real-time location updates.
- Bus location data is used to calculate distance, estimated arrival time (ETA), and bus status.

### 7.3 Data Access and Security

- Student users can read bus location information.
- Only the authorised driver account can write bus location updates.
- Firestore security rules restrict the allowed bus IDs, fields, and statuses.
- Student favourites and notification history are stored locally in the student's browser instead of being uploaded to the server.

---

## 8. API & External Services

The application integrates with external services to support its main functions.

| Service | Purpose |
|---|---|
| Firebase Firestore | Stores and synchronises live bus location data |
| OpenStreetMap | Provides map information for the tracking interface |
| Open-Meteo | Provides weather information |
| OSRM | Used to generate road route line data |

### 8.1 Data Integration

- The driver page sends GPS location updates to Firebase Firestore.
- Student pages receive bus location updates from Firestore.
- Weather information is retrieved from Open-Meteo.
- OpenStreetMap is used to display the map.
- OSRM was used to generate road route lines.

The current project documentation does not specify separate custom REST API endpoints.

---

## 9. Run the Project Locally

```bash
git clone https://github.com/junHao-hub/bus-tracking-system.git
cd bus-tracking-system
npm install
npm run dev
```

Then open http://localhost:5173 in a browser.

## 10. Demo Options

Add these to the end of the address to test without waiting for real time or real rain.

| Address ending | Effect |
|---|---|
| `?time=08:20` | Pretends the time is 08:20 |
| `?rain=1` | Pretends it is raining |
| `?time=08:20&rain=1` | Both at once |

Example: https://bus-tracking-system-nu.vercel.app/?time=08:20&rain=1

Without these options the site uses the real time and the real weather. Outside service hours the timetable shows that there are no more shuttles today.

## 11. Known Limitations

- Each route has one bus.
- Timetable times are planned times and do not change when the bus is late.
- Estimated arrival time uses straight line distance to the stop.
- Reminders only work while the page is open in the browser.
- Favourites and notification history are saved in the browser of each device.

## 12. Team

Team Maroon 4

- Ng Xing Jie
- Tan Jun Hao
- Shamay Ng Weng Sze
- Shenly Chan Yun Xuan

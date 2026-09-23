GramSathi — Solar-Powered Smart Village Monitoring Hub
========================================================

HOW TO RUN
1. Double-click index.html to open it in any web browser
   (Chrome, Edge, Firefox, Safari all work).
2. No install, no server, no internet connection required
   to run the app itself (two Google Font requests are made
   for nicer typography; if offline, it falls back to your
   system fonts automatically — nothing breaks).

WHAT'S INSIDE
- index.html — the entire application (HTML + CSS + JS in
  one file). All sensor data (water, livestock, energy) is
  simulated in the browser for this hackathon demo — no
  real hardware is connected.

DEMO FLOW
1. Start on the Dashboard — everything shows Normal.
2. Go to Water, pick a pump, click "Simulate low water flow."
3. Watch the alert appear and the mode chip change.
4. Open "Community display" from the sidebar to show the
   village-courtyard-screen view with the live warning banner.
5. Exit display mode, go to Livestock, click
   "Simulate health alert" — a simulated SMS alert modal
   opens automatically.
6. Check the Alerts page and its filters.
7. Go to Energy, try "Battery critically low."
8. Click "Reset demo" (top right) to return to a clean state
   before your next run-through.

ARCHITECTURE NOTE
All readings flow through a documented SensorProvider
interface in the code (search for "SensorProvider" in
index.html). It's currently implemented by a
MockSensorProvider driving this demo. A real deployment
would swap in a RealIoTProvider backed by an ESP32 hub and
GSM module, without changing the dashboard, alerts, or
community display code.

# Indoor Positioning Architecture Guide

## Overview
To provide real-time location tracking inside the hospital and update the Wayfinding path dynamically, the application requires an **Indoor Positioning System (IPS)**. Because GPS signals are generally weak or nonexistent indoors, the hospital must deploy local beacon technology to determine the user's origin point accurately.

## Technologies Used for IPS
For a production deployment, a combination of **Bluetooth Low Energy (BLE)** beacons and **Wi-Fi Fingerprinting** is the industry standard for hospitals.

### 1. Bluetooth Low Energy (BLE) Beacons
- **Hardware Integration:** Small, battery-operated BLE devices (beacons) are mounted on ceilings or walls throughout the hospital at roughly 10-15 meter intervals.
- **How it Works (Trilateration):** The patient's mobile device (via a native application wrapper or experimental Web Bluetooth APIs) constantly scans for these BLE signals. By measuring the Received Signal Strength Indicator (RSSI) from at least three nearby beacons simultaneously, the device can estimate its exact coordinates using trilateration.
- **Accuracy:** ~1 to 3 meters, which is highly effective for room-level accuracy.

### 2. Wi-Fi Fingerprinting
- **Hardware Integration:** Utilizes the existing enterprise Wi-Fi access points already present in the hospital.
- **How it Works:** The hospital is pre-mapped. At various points (e.g., in every hallway or room), the RSSI levels of all detectable Wi-Fi access points are recorded, creating a "radio map" or "fingerprint" of the building.
- **Usage:** When the app runs, it scans the current Wi-Fi environment and compares it against the pre-recorded radio map to find the closest match.
- **Accuracy:** ~5 to 10 meters. It serves as a great fallback when BLE signals are obstructed.

## Integration Flow into the Application
1. **Device Scanning:** The Web App (often running inside a progressive web app or a Cordova/Capacitor native shell) requests location permissions and scans for BLE MAC addresses / Wi-Fi signals.
2. **Signal Processor:** The gathered RSSI strength data is sent to an edge or cloud computing service (e.g., an IPS engine like Cisco DNA Spaces or a custom server solution).
3. **Coordinate Response:** The server responds with `(x, y, floor, accuracy)` coordinates.
4. **App Update:** Our `app.js` Wayfinding engine receives this coordinate. We update the starting point (`mapNodes['CurrentLocation']`) instead of the default `'Entrance'`. The 3D CSS map then dynamically recalculates and redraws the SVG path to the destination based on this live origin.

## Privacy & Security
- **Opt-In Basis:** Users must explicitly grant location permissions.
- **No Tracking:** The system calculates the location on the client-side or anonymously on the edge server; the hospital does not need to store the historical movements of specific patients unless explicitly required for emergency protocols.

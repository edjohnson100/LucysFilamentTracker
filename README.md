# Lucy's Filament Tracker
**Browser-based 3D printing filament inventory management.**

![Filament Tracker Preview](resources/preview.png)

## Introduction: The "Why" and "What"

Tracking filament shouldn't take longer than the print itself. I built this tool to solve the "partial roll" headache—knowing exactly how many grams are left on a spool without having to do math every time.

**Lucy's Filament Tracker** is a lightweight, privacy-focused utility that runs entirely in your browser. No account required, no data leaves your machine.

* **Fast Entry:** Seed your inventory from a Google Sheet (70+ rolls in < 30 mins).
* **Smart Filtering:** Cross-filter by Brand and Material Type (PLA, PETG, etc.).
* **Consumption Tracking:** "Open" full rolls to automatically track weights and tare.
* **Total Inventory Value:** Automatically calculates the dollar value of your entire "plastic bank."

## How to Run

This is a **Standalone HTML** application. There is nothing to install on your computer.

1.  **Download:** Download the `filament_tracker.html` file from this repository.
2.  **Run:** Double-click the file to open it in your favorite web browser (Chrome, Safari, or Edge).
3.  **Persistence:** Your data is saved to your browser's local cache. However, it is **highly recommended** to use the "Save JSON" button to create a hard backup on your computer occasionally.

## The Google Sheets "Speed Run" (Optional)

If you have a large collection of filament, you can use a Google Sheet to bulk-load the app:

**Option 1: The Easy Way (Copy Template)**

1.  **Shared Template:** I have created and shared a Google Sheet template that is ready for you to copy and populate. See **Google_Sheets_Setup_Guide.md** for the link and details.

**Option 2: The "From Scratch" Way**

1.  **Template:** Create a Google Sheet with a tab named **"Inventory"** and columns for Brand, Type, Color, Hex, Full Rolls, Partials, Price, Spool Weight, and Notes.
2.  **Script:** Install the provided `Code.gs` script into your sheet via **Extensions > Apps Script**.
3.  **Export:** Use the custom **Filament Tracker** menu in your sheet to export your data to JSON.
4.  **Import:** Click **Load JSON** in the web app and select your exported file.

## Tech Stack

For the fellow coders and makers out there, here is how this was built:

* **Language:** React 18 (via CDN)
* **Styling:** Tailwind CSS
* **Icons:** Custom Internal SVG Library (Embedded for standalone stability)
* **Data Storage:** Browser `localStorage` API + JSON File Export/Import

## Acknowledgements & Credits

* **Developer:** Ed Johnson ([Making With An EdJ](https://www.youtube.com/@makingwithanedj))
* **AI Assistance:** Developed with coding assistance from Google's Gemini model.
* **Lucy (The Cavachon Puppy):**
    ***Chief Wellness Officer & Director of Mandatory Breaks***
    * Thank you for ensuring I maintained healthy circulation by interrupting my deep coding sessions with urgent requests for play.
* **License:** Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.

***

*Happy Making!*
*— EdJ*
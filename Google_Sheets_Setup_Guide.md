# **Filament Inventory: Google Sheets Setup Guide**

This guide explains how to prepare your filament data in a Google Sheet and export it for use in the tracker app.

## **Option 1: The Easy Way (Copy Template)**

If you are using Ed's shared template:

1. Open the shared Google Sheet.  
2. Go to **File \> Make a copy**.  
3. **Authorization:** The first time you run the script (under the "Filament Tracker" menu), Google will warn you that the app isn't verified.  
   * Click **Advanced**.  
   * Click **Go to Filament Tracker (unsafe)**.  
   * *Note: This is standard for private scripts; it just means the script hasn't been reviewed by Google's global security team.*

## **Option 2: The "From Scratch" Way**

If you want to build your own sheet or use an existing one:

### **1\. Tab Name**

Rename your data tab to exactly **Inventory** (case-sensitive). The export script specifically looks for this name and will ignore other tabs like "Notes" or "Calculations."

### **2\. Spreadsheet Structure**

Set up the first row (Header Row) with these exact columns in this order:

| Column | Header Name | Format / Example |
| ----- | ----- | ----- |
| **A** | ID | Leave empty (Script will generate) or enter unique text |
| **B** | Brand | Text (e.g., `Bambu Lab`) |
| **C** | Type | Text (e.g., `PLA Basic`) |
| **D** | Color Name | Text (e.g., `Bambu Green`) |
| **E** | Hex Color | Hex Code (e.g., `#00AE42`) |
| **F** | Full Rolls | Number (e.g., `2`) |
| **G** | Partial Weights | Comma separated numbers (e.g., `450, 120`) |
| **H** | Price | Number (e.g., `24.99`) |
| **I** | Spool Weight | Number (e.g., `250`) |
| **J** | Notes | Text (e.g., `Cardboard spool, needs adapter`) |

### **3\. Install the "Magic" Script**

This script converts your rows into the JSON format the app expects.

1. In your Google Sheet, go to **Extensions \> Apps Script**.  
2. Delete any default code (`function myFunction() {...}`) and paste the code from the `GoogleSheetScript.gs` file in this repository.  
3. Click the **Save** icon (floppy disk).  
4. Refresh your Google Sheet tab.  
5. You will now see a new menu item called **"Filament Tracker"** at the top.

## **🚀 How to Export**

1. Click **Filament Tracker \> Export to JSON**.  
2. A large modal window will appear with your JSON data already selected.  
3. **Copy** the text (Ctrl+C / Cmd+C).  
4. Create a new text file on your computer, paste the data, and save it as `inventory.json`.  
5. Upload this file into the Filament Tracker App\!


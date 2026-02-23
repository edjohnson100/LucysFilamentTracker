/**
 * LUCY'S FILAMENT TRACKER - GOOGLE SHEETS INTEGRATION
 * v1.6 2026-02-22
 * ===============
 * * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any existing code.
 * 4. Paste this entire file in.
 * 5. Save (Floppy Disk Icon).
 * 6. Reload your Google Sheet tab to see the menu.
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Filament Tracker')
      .addItem('Export JSON File', 'exportSheetToJSONFile')
      .addSeparator()
      .addItem('Import JSON File', 'showImportFileDialog')
      .addToUi();
}

// --- HELPER FUNCTION: Read Sheet and generate JSON string ---
function generateJSONString() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Inventory');
  
  if (!sheet) {
    throw new Error("Could not find a sheet named 'Inventory'.\n\nPlease rename your main data tab to 'Inventory' (Case sensitive).");
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    throw new Error("No data found in the 'Inventory' tab!");
  }
  
  // Grab columns A through L (12 columns now)
  const data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  const jsonList = [];

  data.forEach((row, index) => {
    const id = row[0] ? String(row[0]) : cryptoUUID();

    let partials = [];
    if (row[6]) {
      const weights = String(row[6]).split(',');
      const notes = row[10] ? String(row[10]).split(',') : [];
     
      partials = weights.map((w, i) => ({
        id: cryptoUUID(), 
        weight: parseInt(w.trim()) || 0,
        note: notes[i] ? notes[i].trim() : '' 
      }));
    }

    const item = {
      id: id,
      brand: String(row[1]),
      type: String(row[2]),
      colorName: String(row[3]),
      hexColor: String(row[4] || '#000000'),
      fullRolls: parseInt(row[5]) || 0,
      partials: partials,
      price: parseFloat(row[7]) || 0,
      spoolWeight: parseInt(row[8]) || 0,
      notes: String(row[9] || ''),
      orderedRolls: parseInt(row[11]) || 0 // New Field
    };
    jsonList.push(item);
  });

  return JSON.stringify(jsonList, null, 2);
}

// --- EXPORT FUNCTION: Download File ---
function exportSheetToJSONFile() {
  try {
    const jsonString = generateJSONString();
    downloadJSONFile(jsonString);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error: " + e.message);
  }
}

function downloadJSONFile(content) {
  const htmlContent = `
    <style>
      body { font-family: sans-serif; padding: 15px; text-align: center; background-color: #f8fafc; }
      .btn { display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: background-color 0.2s; }
      .btn:hover { background-color: #4338ca; }
      .text { color: #334155; font-size: 14px; margin-bottom: 5px; }
      .hint { font-size: 13px; color: #475569; margin-top: 20px; background: #e2e8f0; padding: 12px; border-radius: 6px; text-align: left; line-height: 1.4; }
    </style>
    
    <div class="text">
      Your inventory file is ready!
    </div>
    
    <a id="downloadLink" class="btn" href="#">Save JSON File</a>
    
    <div class="hint">
      <strong>Want to rename or choose the folder?</strong><br>
      If your browser automatically downloads files, right-click the button above and select <strong>"Save link as..."</strong> (or "Download Linked File As..." on Mac) to choose where to save it.
      <br><br>
      <em>Note: A normal left-click will send it to your default Downloads folder unless your browser is set to ask for a location every time.</em>
    </div>
    
    <script>
      const content = ${JSON.stringify(content)};
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.getElementById('downloadLink');
      link.href = url;
      link.download = 'lucy_inventory.json';
      
      link.addEventListener('click', function() {
        setTimeout(function() {
          google.script.host.close();
        }, 1500);
      });
    </script>
  `;
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent).setWidth(450).setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Save Inventory');
}

// --- IMPORT FUNCTION: Read File ---
function showImportFileDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: sans-serif; padding: 15px; }
      .container { display: flex; flex-direction: column; gap: 15px; }
      input[type="file"] { border: 1px solid #ccc; padding: 10px; border-radius: 4px; background: #f8fafc; cursor: pointer; }
      button { background-color: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background-color 0.2s; }
      button:hover { background-color: #4338ca; }
      button:disabled { background-color: #a5b4fc; cursor: not-allowed; }
      .warning { color: #b91c1c; background-color: #fef2f2; padding: 10px; border-radius: 4px; border: 1px solid #fecaca; font-size: 0.9em; }
      #status { font-size: 0.9em; color: #4b5563; font-style: italic; }
    </style>
    <div class="container">
      <div class="warning">
        <strong>⚠️ Warning:</strong> This will OVERWRITE all data in the "Inventory" tab.
      </div>
      <p>Select your saved <strong>.json</strong> file from your computer:</p>
      <input type="file" id="fileInput" accept=".json" />
      <button id="importBtn" onclick="handleFile()">Import File</button>
      <div id="status"></div>
    </div>
    <script>
      function handleFile() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        const statusDiv = document.getElementById('status');
        const btn = document.getElementById('importBtn');
        if (!file) {
          alert('Please select a file first.');
          return;
        }

        btn.disabled = true;
        statusDiv.innerText = 'Reading file...';

        const reader = new FileReader();
        reader.onload = function(e) {
          const content = e.target.result;
          statusDiv.innerText = 'Importing data to sheet... please wait.';
          
          google.script.run
            .withSuccessHandler(closeModal)
            .withFailureHandler(showError)
            .processJSONImport(content);
        };
        
        reader.onerror = function() {
          alert('Error reading file.');
          btn.disabled = false;
          statusDiv.innerText = '';
        };
        
        reader.readAsText(file);
      }
      
      function closeModal() { google.script.host.close(); }
      function showError(err) { 
        alert('Error: ' + err);
        document.getElementById('importBtn').disabled = false;
        document.getElementById('status').innerText = '';
      }
    </script>
  `).setWidth(500).setHeight(320);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Import JSON File');
}

function processJSONImport(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) throw new Error("JSON must be an array of items.");
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Inventory');
    if (!sheet) {
      sheet = ss.insertSheet('Inventory');
      // Added Ordered Rolls to Header
      sheet.appendRow(['ID', 'Brand', 'Type', 'Color Name', 'Hex Color', 'Full Rolls', 'Partial Weights', 'Price', 'Spool Weight', 'Notes', 'Partial Notes', 'Ordered Rolls']);
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 12).clearContent();
    }
    
    if (data.length === 0) return;
    
    const rows = data.map(item => {
      const partialWeights = item.partials && Array.isArray(item.partials)
        ? item.partials.map(p => p.weight).join(', ') 
        : '';
        
      const partialNotes = item.partials && Array.isArray(item.partials)
        ? item.partials.map(p => p.note || '').join(', ') 
        : '';

      return [
        item.id || cryptoUUID(),        // A: ID
        item.brand || '',               // B: Brand
        item.type || '',                // C: Type
        item.colorName || '',           // D: Color Name
        item.hexColor || '#000000',     // E: Hex
        item.fullRolls || 0,            // F: Full Rolls
        partialWeights,                 // G: Partial Weights
        item.price || 0,                // H: Price
        item.spoolWeight || 0,          // I: Spool Weight
        item.notes || '',               // J: Notes (Main)
        partialNotes,                   // K: Partial Notes
        item.orderedRolls || 0          // L: Ordered Rolls
      ];
    });

    const dataRange = sheet.getRange(2, 1, rows.length, 12);
    dataRange.setValues(rows);
    sheet.autoResizeColumns(1, 12);
    dataRange.sort([
      { column: 2, ascending: true }, 
      { column: 3, ascending: true }, 
      { column: 4, ascending: true }  
    ]);
    SpreadsheetApp.getUi().alert("Success! " + rows.length + " items imported and sorted.");
  } catch (e) {
    throw new Error("Failed to parse JSON: " + e.message);
  }
}

function cryptoUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
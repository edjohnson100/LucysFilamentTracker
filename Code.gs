/**
 * LUCY'S FILAMENT TRACKER - GOOGLE SHEETS INTEGRATION
 * v1.7 2026-02-23
 * ===============
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Filament Tracker')
      .addItem('Export JSON File', 'exportSheetToJSONFile')
      .addSeparator()
      .addItem('Import JSON File', 'showImportFileDialog')
      .addToUi();
}

function generateJSONString() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Inventory');
  
  if (!sheet) throw new Error("Could not find a sheet named 'Inventory'.");

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error("No data found in the 'Inventory' tab!");
  
  // Grab columns A through M (13 columns)
  const data = sheet.getRange(2, 1, lastRow - 1, 13).getValues();
  const jsonList = [];

  data.forEach((row) => {
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

    jsonList.push({
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
      orderedRolls: parseInt(row[11]) || 0,
      location: String(row[12] || '') // New Field (Col M)
    });
  });

  return JSON.stringify(jsonList, null, 2);
}

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
    <style>body { font-family: sans-serif; padding: 15px; text-align: center; background-color: #f8fafc; } .btn { display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px; } </style>
    <div>Your inventory file is ready!</div>
    <a id="downloadLink" class="btn" href="#">Save JSON File</a>
    <script>
      const content = ${JSON.stringify(content)};
      const blob = new Blob([content], { type: 'application/json' });
      const link = document.getElementById('downloadLink');
      link.href = URL.createObjectURL(blob);
      link.download = 'lucy_inventory.json';
      link.addEventListener('click', function() { setTimeout(function() { google.script.host.close(); }, 1500); });
    </script>
  `;
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(htmlContent).setWidth(450).setHeight(200), 'Save Inventory');
}

function showImportFileDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>body { font-family: sans-serif; padding: 15px; } input { margin-bottom: 15px; display: block; } button { background-color: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }</style>
    <p>Select your <strong>.json</strong> file:</p>
    <input type="file" id="fileInput" accept=".json" />
    <button onclick="handleFile()">Import</button>
    <script>
      function handleFile() {
        const file = document.getElementById('fileInput').files[0];
        if (!file) return alert('Select a file.');
        const reader = new FileReader();
        reader.onload = function(e) { google.script.run.withSuccessHandler(() => google.script.host.close()).processJSONImport(e.target.result); };
        reader.readAsText(file);
      }
    </script>
  `).setWidth(400).setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, 'Import JSON File');
}

function processJSONImport(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) throw new Error("Invalid JSON");
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Inventory');
    if (!sheet) {
      sheet = ss.insertSheet('Inventory');
      sheet.appendRow(['ID', 'Brand', 'Type', 'Color Name', 'Hex Color', 'Full Rolls', 'Partial Weights', 'Price', 'Spool Weight', 'Notes', 'Partial Notes', 'Ordered Rolls', 'Location']);
      sheet.getRange(1, 1, 1, 13).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, 13).clearContent();
    if (data.length === 0) return;
    
    const rows = data.map(item => [
      item.id || cryptoUUID(),
      item.brand || '',
      item.type || '',
      item.colorName || '',
      item.hexColor || '#000000',
      item.fullRolls || 0,
      (item.partials || []).map(p => p.weight).join(', '),
      item.price || 0,
      item.spoolWeight || 0,
      item.notes || '',
      (item.partials || []).map(p => p.note || '').join(', '),
      item.orderedRolls || 0,
      item.location || '' // New Field
    ]);

    const dataRange = sheet.getRange(2, 1, rows.length, 13);
    dataRange.setValues(rows);
    sheet.autoResizeColumns(1, 13);
    dataRange.sort([{ column: 2 }, { column: 3 }, { column: 4 }]);
  } catch (e) {
    throw new Error("Import failed: " + e.message);
  }
}

function cryptoUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (c === 'x' ? Math.random()*16|0 : (Math.random()*16|0)&0x3|0x8).toString(16));
}
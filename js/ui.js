// UI Functions
let trees = [];
let currentVolume = 0;
let editingIndex = -1;
let currentLocation = "";
let allowNavigation = false;
let pendingCSVData = null;

function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  menu.classList.toggle("show");
}

function updateSpecies() {
  const name = document.getElementById('tradeName').value;
  const sp = getSpeciesByName(name);
  if (sp) {
    document.getElementById('code').value = sp.c;
    document.getElementById('minDiam').value = sp.d;
    checkDiameter();
  }
}

function checkDiameter() {
  const dbh = parseFloat(document.getElementById('dbh').value);
  const minD = parseFloat(document.getElementById('minDiam').value);
  const warn = document.getElementById('warning');
  
  if (dbh && minD && dbh < minD) {
    warn.textContent = `⚠️ DBH (${dbh} cm) is below minimum cutting diameter (${minD} cm). After calculating volume, quality will be set to "3 - Unexploitable".`;
    warn.classList.remove('hidden');
  } else {
    warn.classList.add('hidden');
  }
}

function updateQuality() {
  const q = document.getElementById('quality').value;
  const qualityAllowsCalc = (q === '1' || q === '2');
  const canCalc = qualityAllowsCalc;
  
  document.getElementById('calcBtn').disabled = !canCalc;
  document.getElementById('dbh').disabled = false;
  document.getElementById('height').disabled = false;
  
  if (!canCalc) {
    document.getElementById('volDisplay').classList.add('hidden');
    currentVolume = 0;
  }
}

function saveTree() {
  const area = document.getElementById('area').value.trim();
  const plot = document.getElementById('plot').value.trim();
  const name = document.getElementById('tradeName').value;
  const quality = document.getElementById('quality').value;
  const eastingX = document.getElementById('eastingX').value.trim();
  const northingY = document.getElementById('northingY').value.trim();
  
  if (!area || !plot || !name || !quality || !eastingX || !northingY) {
    alert('Please fill all required fields including Easting (X) and Northing (Y)');
    return;
  }
  
  const tree = {
    id: editingIndex === -1 ? trees.length + 1 : trees[editingIndex].id,
    area: area,
    plot: plot,
    tradeName: name,
    code: document.getElementById('code').value,
    minDiam: document.getElementById('minDiam').value,
    dbh: document.getElementById('dbh').value,
    height: document.getElementById('height').value,
    quality: quality,
    qualityText: document.getElementById('quality').options[document.getElementById('quality').selectedIndex].text,
    volume: currentVolume,
    eastingX: eastingX,
    northingY: northingY,
    obs: document.getElementById('obs').value,
    method: document.getElementById('volMethod').value
  };
  
  if (editingIndex === -1) {
    trees.push(tree);
  } else {
    trees[editingIndex] = tree;
    editingIndex = -1;
  }
  
  renderTrees();
  updateStats();
  updateLocationHeader();
  clearForm();
}

function renderTrees() {
  const cont = document.getElementById('trees');
  if (trees.length === 0) {
    cont.innerHTML = '<p style="color:#999;">No trees recorded yet.</p>';
    updateExportButton();
    return;
  }
  
  cont.innerHTML = trees.map((t, i) => `
    <div class="tree-card">
      <div class="tree-card-header">
        <strong>Tree #${t.id} - ${t.tradeName}</strong>
        <span>${t.qualityText}</span>
      </div>
      <div class="tree-card-body">
        <div><span class="tree-field-label">Plot</span><span>${t.plot}</span></div>
        <div><span class="tree-field-label">Code</span><span>${t.code}</span></div>
        <div><span class="tree-field-label">DBH</span><span>${t.dbh || 'N/A'} cm</span></div>
        <div><span class="tree-field-label">Height</span><span>${t.height || 'N/A'} m</span></div>
        <div><span class="tree-field-label">Volume</span><span>${t.volume.toFixed(4)} m³</span></div>
        <div><span class="tree-field-label">Coords</span><span>${t.eastingX || 'N/A'}, ${t.northingY || 'N/A'}</span></div>
      </div>
      <div class="tree-card-actions">
        <button class="btn-action btn-edit" onclick="editTree(${i})">✏️ Edit</button>
        <button class="btn-action btn-delete" onclick="deleteTree(${i})">🗑️ Delete</button>
      </div>
    </div>
  `).join('');
  
  updateExportButton();
}

function updateStats() {
  document.getElementById('totalTrees').textContent = trees.length;
  const harv = trees.filter(t => t.quality === '1' || t.quality === '2').length;
  document.getElementById('harvestable').textContent = harv;
  document.getElementById('rejected').textContent = trees.length - harv;
  const totVol = trees.reduce((sum, t) => sum + (t.volume || 0), 0);
  document.getElementById('totalVol').textContent = totVol.toFixed(2);

   updateExportButton();
}

function updateLocationHeader() {
  const locationHeader = document.getElementById("locationHeader");
  if (!locationHeader) return;
  
  const areaName = document.getElementById("areaName");
  const plotName = document.getElementById("plotName");
  const areaInput = document.getElementById("area").value.trim();
  const plotInput = document.getElementById("plot").value.trim();
  
  if (areaInput && trees.length > 0) {
    currentLocation = areaInput;
    if (areaName) {
      areaName.textContent = currentLocation;
    }
    // Remove plot display since plots vary per tree
    if (plotName) {
      plotName.parentElement.style.display = 'none';
    }
    locationHeader.classList.remove("hidden");
  } else {
    locationHeader.classList.add("hidden");
  }
}

function editTree(i) {
  const t = trees[i];
  editingIndex = i;
  
  // Populate edit modal fields
  document.getElementById('editArea').value = t.area;
  document.getElementById('editPlot').value = t.plot;
  document.getElementById('editTradeName').value = t.tradeName;
  
  // Populate species dropdown in edit modal
  const editSel = document.getElementById('editTradeName');
  if (!editSel.options.length || editSel.options.length === 1) {
    editSel.innerHTML = '<option value="">Select trade name...</option>' + 
      species.map(s => `<option value="${s.n}">${s.n}</option>`).join('');
  }
  editSel.value = t.tradeName;
  
  updateEditSpecies();
  document.getElementById('editDbh').value = t.dbh;
  document.getElementById('editHeight').value = t.height;
  document.getElementById('editQuality').value = t.quality;
  document.getElementById('editEastingX').value = t.eastingX;
  document.getElementById('editNorthingY').value = t.northingY;
  document.getElementById('editObs').value = t.obs;
  document.getElementById('editVolMethod').value = t.method;
  
  recalculateVolume();
  
  document.getElementById('editModal').classList.add('show');
  window.scrollTo(0, 0);
}

function deleteTree(i) {
  if (confirm('Are you sure you want to delete this tree?')) {
    trees.splice(i, 1);
    trees.forEach((t, index) => {
      t.id = index + 1;
    });
    renderTrees();
    updateStats();
    updateLocationHeader();
  }
}

function clearForm() {
  const area = document.getElementById('area').value;
  const plot = document.getElementById('plot').value;
  
  document.getElementById('area').value = '';
  document.getElementById('plot').value = '';
  document.getElementById('tradeName').value = '';
  document.getElementById('code').value = '';
  document.getElementById('minDiam').value = '';
  document.getElementById('dbh').value = '';
  document.getElementById('height').value = '';
  document.getElementById('quality').value = '';
  document.getElementById('eastingX').value = '';
  document.getElementById('northingY').value = '';
  document.getElementById('obs').value = '';
  document.getElementById('volDisplay').classList.add('hidden');
  document.getElementById('warning').classList.add('hidden');
  currentVolume = 0;
  editingIndex = -1;
  
  document.getElementById('area').value = area;
  document.getElementById('plot').value = plot;
  updateQuality();
}

function exportCSV() {
  // Close menu after clicking
  const menu = document.getElementById("dropdownMenu");
  if (menu) {
    menu.classList.remove("show");
  }

  if (trees.length === 0) {
    alert('No data to export');
    return;
  }
  
  const area = currentLocation || document.getElementById('area').value.trim() || 'Unknown';
  let csv = 'AREA;PLOT;TREE_ID;TRADE_NAME;CODE;MIN_DIAM;DBH;HEIGHT;QUALITY;VOLUME;EASTING_X;NORTHING_Y;OBSERVATIONS\n';
  
  trees.forEach(t => {
    csv += `${area};${t.plot};${t.id};${t.tradeName};${t.code};${t.minDiam};${t.dbh};${t.height};${t.qualityText};${t.volume.toFixed(4)};${t.eastingX};${t.northingY};${t.obs}\n`;
  });
  
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${area}_Forest_Inventory.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showNewLocationModal() {
  // Close menu after clicking
  const menu = document.getElementById("dropdownMenu");
  if (menu) {
    menu.classList.remove("show");
  }
  
  if (trees.length === 0) {
    clearAllData();
    return;
  }
  document.getElementById("newLocationModal").classList.add("show");
}

function closeModal() {
  document.getElementById("newLocationModal").classList.remove("show");
}

function clearDataWithoutExport() {
  clearAllData();
  closeModal();
}

function exportAndClear() {
  exportCSV();
  clearAllData();
  closeModal();
}

function clearAllData() {
  trees = [];
  currentLocation = "";
  document.getElementById("area").value = "";
  document.getElementById("plot").value = "";
  renderTrees();
  updateStats();
  updateLocationHeader();
}

function cancelRefresh() {
  document.getElementById("refreshWarningModal").classList.remove("show");
  allowNavigation = false;
}

function proceedWithoutExport() {
  document.getElementById("refreshWarningModal").classList.remove("show");
  allowNavigation = true;
  window.location.reload();
}

function exportAndLeave() {
  exportCSV();
  document.getElementById("refreshWarningModal").classList.remove("show");
  allowNavigation = true;
  setTimeout(() => {
    window.location.reload();
  }, 100);
}

function showUserGuide() {
  document.getElementById("userGuideModal").classList.add("show");
  document.getElementById("dropdownMenu").classList.remove("show");
}

function closeUserGuide() {
  document.getElementById("userGuideModal").classList.remove("show");
}

function showAboutDeveloper() {
  document.getElementById("aboutDeveloperModal").classList.add("show");
  document.getElementById("dropdownMenu").classList.remove("show");
}

function closeAboutDeveloper() {
  document.getElementById("aboutDeveloperModal").classList.remove("show");
}

document.addEventListener('click', function(e) {
  const menu = document.getElementById("dropdownMenu");
  const menuBtn = document.querySelector(".menu-btn");
  if (menu && menuBtn && !menu.contains(e.target) && !menuBtn.contains(e.target)) {
    menu.classList.remove("show");
  }
});

function openCSVFile() {
  document.getElementById("dropdownMenu").classList.remove("show");
  document.getElementById("csvFileInput").click();
}

function showCSVImportModal(data, fileName) {
  const modal = document.getElementById("csvImportModal");
  const message = document.getElementById("csvImportMessage");
  const preview = document.getElementById("csvPreview");
  const previewContent = document.getElementById("csvPreviewContent");
  const replaceBtn = document.getElementById("replaceBtn");
  
  pendingCSVData = data;
  
  let previewText = `<strong>File:</strong> ${fileName}<br>`;
  previewText += `<strong>Records found:</strong> ${data.records.length}<br>`;
  if (data.location) {
    previewText += `<strong>Area:</strong> ${data.location}`;
  }
  
  previewContent.innerHTML = previewText;
  preview.style.display = 'block';
  
  if (trees.length > 0) {
    message.textContent = `You have ${trees.length} existing record(s). Do you want to add these ${data.records.length} new record(s) or replace all existing data?`;
    replaceBtn.style.display = 'inline-block';
  } else {
    message.textContent = `Import ${data.records.length} record(s) from ${fileName}?`;
    replaceBtn.style.display = 'none';
  }
  
  modal.classList.add("show");
}

function cancelCSVImport() {
  document.getElementById("csvImportModal").classList.remove("show");
  pendingCSVData = null;
  document.getElementById("csvFileInput").value = "";
}

function confirmCSVImport() {
  if (!pendingCSVData) {
    alert('No data to import');
    return;
  }
  
  try {
    const startId = trees.length + 1;
    
    for (let i = 0; i < pendingCSVData.records.length; i++) {
      const record = pendingCSVData.records[i];
      trees.push({
        id: startId + i,
        area: record.area,
        plot: record.plot,
        tradeName: record.tradeName,
        code: record.code,
        minDiam: record.minDiam,
        dbh: record.dbh,
        height: record.height,
        quality: record.quality,
        qualityText: record.qualityText,
        volume: record.volume,
        eastingX: record.eastingX,
        northingY: record.northingY,
        obs: record.obs,
        method: record.method || 'form'
      });
    }
    
    if (pendingCSVData.location && !document.getElementById("area").value.trim()) {
      document.getElementById("area").value = pendingCSVData.location;
    }
    
    const count = pendingCSVData.records.length;
    
    renderTrees();
    updateStats();
    updateLocationHeader();
    cancelCSVImport();
    
    alert('Successfully imported ' + count + ' records!');
  } catch (error) {
    console.error('Import error:', error);
    alert('Error importing data: ' + error.message);
  }
}

function importCSVReplace() {
  if (!pendingCSVData) {
    alert('No data to import');
    return;
  }
  
  try {
    trees = [];
    
    for (let i = 0; i < pendingCSVData.records.length; i++) {
      const record = pendingCSVData.records[i];
      trees.push({
        id: i + 1,
        area: record.area,
        plot: record.plot,
        tradeName: record.tradeName,
        code: record.code,
        minDiam: record.minDiam,
        dbh: record.dbh,
        height: record.height,
        quality: record.quality,
        qualityText: record.qualityText,
        volume: record.volume,
        eastingX: record.eastingX,
        northingY: record.northingY,
        obs: record.obs,
        method: record.method || 'form'
      });
    }
    
    if (pendingCSVData.location) {
      document.getElementById("area").value = pendingCSVData.location;
    }
    
    const count = pendingCSVData.records.length;
    
    renderTrees();
    updateStats();
    updateLocationHeader();
    cancelCSVImport();
    
    alert('Successfully imported ' + count + ' records! Previous data was replaced.');
  } catch (error) {
    console.error('Replace error:', error);
    alert('Error replacing data: ' + error.message);
  }
}

function parseCSVFile(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const text = e.target.result;
      let lines = text.split(/\r?\n/);
      
      if (lines.length < 2) {
        alert("Invalid CSV file format. File appears to be empty or corrupted.");
        return;
      }
      
      let location = "";
      const headers = lines[0].split(';');
      const records = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(';');
        if (values.length < 13) {
          console.warn('Skipping incomplete row ' + i + ':', values);
          continue;
        }
        
        records.push({
          area: values[0].trim(),
          plot: values[1].trim(),
          tradeName: values[3].trim(),
          code: values[4].trim(),
          minDiam: values[5].trim(),
          dbh: values[6].trim(),
          height: values[7].trim(),
          qualityText: values[8].trim(),
          volume: parseFloat(values[9].trim()) || 0,
          eastingX: values[10].trim(),
          northingY: values[11].trim(),
          obs: values[12].trim(),
          quality: values[8].includes('Perfect') ? '1' :
                   values[8].includes('Slight') ? '2' :
                   values[8].includes('Unexploitable') ? '3' : '4',
          method: 'form'
        });
        
        if (!location && values[0]) {
          location = values[0].trim();
        }
      }
      
      if (records.length === 0) {
        alert("No valid records found in the CSV file.");
        return;
      }
      
      console.log('Successfully parsed ' + records.length + ' records from CSV');
      showCSVImportModal({ location: location, records: records }, file.name);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      alert("Error parsing CSV file. Please ensure it's in the correct format.\n\nError: " + error.message);
    }
  };
  
  reader.onerror = function() {
    alert("Error reading file. Please try again.");
  };
  
  reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('csvFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        if (!file.name.endsWith('.csv')) {
          alert("Please select a CSV file.");
          return;
        }
        parseCSVFile(file);
      }
    });
  }
});

function updateOnlineStatus() {
  const statusElement = document.getElementById('onlineStatus');
  if (statusElement) {
    if (navigator.onLine) {
      statusElement.textContent = '● Online';
      statusElement.className = 'status-online';
    } else {
      statusElement.textContent = '● Offline';
      statusElement.className = 'status-offline';
    }
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

window.addEventListener('beforeunload', function(e) {
  if (trees.length > 0 && !allowNavigation) {
    e.preventDefault();
    e.returnValue = 'You have unsaved data. Are you sure you want to leave?';
    return e.returnValue;
  }
});

document.addEventListener('keydown', function(e) {
  if ((e.key === 'F5') || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
    if (trees.length > 0 && !allowNavigation) {
      e.preventDefault();
      document.getElementById("refreshWarningModal").classList.add("show");
    }
  }
});

document.addEventListener('DOMContentLoaded', function() {
  updateOnlineStatus();
});

function printResults() {
document.getElementById("dropdownMenu").classList.remove("show");
  if (trees.length === 0) {
    alert("No trees to print. Please add some tree records first.");
    return;
  }
  
  const printLocation = document.getElementById("printLocation");
  const printDate = document.getElementById("printDate");
  const printTimestamp = document.getElementById("printTimestamp");
  const copyrightYear = document.getElementById("copyrightYear");
  
  // Set copyright year to current year
  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
  }
  
  if (printLocation) {
    printLocation.textContent = currentLocation ? `Area: ${currentLocation}` : "Area: Not specified";
  }
  
  if (printDate) {
    const now = new Date();
    printDate.textContent = `Report generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  }
  
  if (printTimestamp) {
    const now = new Date();
    printTimestamp.textContent = `${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
  }
  
  document.getElementById("printTotalTrees").textContent = trees.length;
  const harv = trees.filter(t => t.quality === '1' || t.quality === '2').length;
  document.getElementById("printHarvestable").textContent = harv;
  document.getElementById("printRejected").textContent = trees.length - harv;
  const totVol = trees.reduce((sum, t) => sum + (t.volume || 0), 0);
  document.getElementById("printTotalVol").textContent = totVol.toFixed(2);
  
  createPrintTable();
  
  setTimeout(() => {
    window.print();
  }, 100);
}

function createPrintTable() {
  const container = document.getElementById("trees");
  
  let tableHTML = `
    <table class="print-table" style="display: none;">
      <thead>
        <tr>
          <th>Tree ID</th>
          <th>Plot</th>
          <th>Species</th>
          <th>Code</th>
          <th>DBH (cm)</th>
          <th>Height (m)</th>
          <th>Quality</th>
          <th>Volume (m³)</th>
          <th>Coordinates</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  trees.forEach(t => {
    tableHTML += `
      <tr>
        <td>${t.id}</td>
        <td>${t.plot}</td>
        <td>${t.tradeName}</td>
        <td>${t.code}</td>
        <td>${t.dbh || 'N/A'}</td>
        <td>${t.height || 'N/A'}</td>
        <td>${t.qualityText}</td>
        <td>${t.volume.toFixed(4)}</td>
        <td>${t.eastingX}, ${t.northingY}</td>
      </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  const existingTable = container.querySelector('.print-table');
  if (existingTable) {
    existingTable.remove();
  }
  
  container.insertAdjacentHTML('beforeend', tableHTML);
}

function updateEditSpecies() {
  const name = document.getElementById('editTradeName').value;
  const sp = getSpeciesByName(name);
  if (sp) {
    document.getElementById('editCode').value = sp.c;
    document.getElementById('editMinDiam').value = sp.d;
  }
}

function recalculateVolume() {
  const D = parseFloat(document.getElementById('editDbh').value);
  const H = parseFloat(document.getElementById('editHeight').value);
  const method = document.getElementById('editVolMethod').value;
  const quality = document.getElementById('editQuality').value;
  
  if (!D || !H || !quality) {
    document.getElementById('editCalculatedVolume').textContent = '0.00';
    document.getElementById('editTreeStatus').textContent = '-';
    return;
  }
  
  let vol = 0;
  if (method === 'form') {
    vol = calculateFormFactorVolume(D, H);
  } else {
    vol = calculateConicVolume(D, H);
  }
  
  document.getElementById('editCalculatedVolume').textContent = vol.toFixed(4);
  
  if (quality === '1' || quality === '2') {
    document.getElementById('editTreeStatus').textContent = 'Harvestable';
  } else {
    document.getElementById('editTreeStatus').textContent = 'Not Harvestable';
  }
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('show');
}

function saveEditedTree() {
  if (editingIndex === -1) return;
  
  const area = document.getElementById('editArea').value.trim();
  const plot = document.getElementById('editPlot').value.trim();
  const name = document.getElementById('editTradeName').value;
  const quality = document.getElementById('editQuality').value;
  const eastingX = document.getElementById('editEastingX').value.trim();
  const northingY = document.getElementById('editNorthingY').value.trim();
  
  if (!area || !plot || !name || !quality || !eastingX || !northingY) {
    alert('Please fill in all required fields.');
    return;
  }
  
  const D = parseFloat(document.getElementById('editDbh').value);
  const H = parseFloat(document.getElementById('editHeight').value);
  const method = document.getElementById('editVolMethod').value;
  
  let vol = 0;
  if (method === 'form') {
    vol = calculateFormFactorVolume(D, H);
  } else {
    vol = calculateConicVolume(D, H);
  }
  
  trees[editingIndex] = {
    id: trees[editingIndex].id,
    area: area,
    plot: plot,
    tradeName: name,
    code: document.getElementById('editCode').value,
    minDiam: document.getElementById('editMinDiam').value,
    dbh: document.getElementById('editDbh').value,
    height: document.getElementById('editHeight').value,
    quality: quality,
    qualityText: document.getElementById('editQuality').options[document.getElementById('editQuality').selectedIndex].text,
    volume: vol,
    eastingX: eastingX,
    northingY: northingY,
    obs: document.getElementById('editObs').value,
    method: method
  };
  
  renderTrees();
  updateStats();
  updateLocationHeader();
  closeEditModal();
}
function showUserGuide() {
  document.getElementById("userGuideModal").classList.add("show");
  document.getElementById("dropdownMenu").classList.remove("show");
}

function closeUserGuide() {
  document.getElementById("userGuideModal").classList.remove("show");
}

function showAboutDeveloper() {
  document.getElementById("aboutDeveloperModal").classList.add("show");
  document.getElementById("dropdownMenu").classList.remove("show");
}

function closeAboutDeveloper() {
  document.getElementById("aboutDeveloperModal").classList.remove("show");
}

// Initialize species dropdown
function initializeSpeciesDropdown() {
  const sel = document.getElementById('tradeName');
  if (!sel) {
    console.error('Select element not found');
    return;
  }
  
  // Check if species is available globally
  if (typeof window.species === 'undefined' && typeof species === 'undefined') {
    console.error('Species data not loaded');
    return;
  }
  
  const speciesData = window.species || species;
  
  sel.innerHTML = '<option value="">Select trade name...</option>' +
    speciesData.map(s => `<option value="${s.n}">${s.n}</option>`).join('');
    
  console.log('Loaded ' + speciesData.length + ' species');
}

// Export species globally
if (typeof window !== 'undefined') {
  window.species = species;
}

function updateExportButton() {
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    if (trees.length > 0) {
      exportBtn.disabled = false;
    } else {
      exportBtn.disabled = true;
    }
  }
}
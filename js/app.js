// Main application logic
// Global state
let trees = [];
let currentVolume = 0;
let editingIndex = -1;
let currentLocation = "";
let allowNavigation = false;
let pendingCSVData = null;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
  /*
  // Initialize species dropdown
  initializeSpeciesDropdown();
  */

  // Initialize stats display
  updateStats();
  
  // Warn user before page refresh if there's unsaved data
  window.addEventListener('beforeunload', function(e) {
    if (trees.length > 0 && !allowNavigation) {
      e.preventDefault();
      e.returnValue = 'You have unsaved data. Are you sure you want to leave?';
      return e.returnValue;
    }
  });
  
  // Intercept F5 and Ctrl+R for refresh
  document.addEventListener('keydown', function(e) {
    // F5 or Ctrl+R or Cmd+R
    if ((e.key === 'F5') || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
      if (trees.length > 0 && !allowNavigation) {
        e.preventDefault();
        document.getElementById("refreshWarningModal").classList.add("show");
      }
    }
  });
  
  // Register service worker for offline functionality
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
  
  console.log('Forest Inventory App initialized');
});

// Make functions available globally
window.initializeSpeciesDropdown = initializeSpeciesDropdown;
window.toggleMenu = toggleMenu;
window.updateSpecies = updateSpecies;
window.checkDiameter = checkDiameter;
window.updateQuality = updateQuality;
window.saveTree = saveTree;
window.renderTrees = renderTrees;
window.updateStats = updateStats;
window.updateLocationHeader = updateLocationHeader;
window.editTree = editTree;
window.deleteTree = deleteTree;
window.clearForm = clearForm;
window.exportCSV = exportCSV;
window.printResults = printResults;
window.createPrintTable = createPrintTable;
window.showNewLocationModal = showNewLocationModal;
window.closeModal = closeModal;
window.clearDataWithoutExport = clearDataWithoutExport;
window.exportAndClear = exportAndClear;
window.clearAllData = clearAllData;
window.cancelRefresh = cancelRefresh;
window.proceedWithoutExport = proceedWithoutExport;
window.exportAndLeave = exportAndLeave;
window.openCSVFile = openCSVFile;
window.showUserGuide = showUserGuide;
window.closeUserGuide = closeUserGuide;
window.showAboutDeveloper = showAboutDeveloper;
window.closeAboutDeveloper = closeAboutDeveloper;
window.showCSVImportModal = showCSVImportModal;
window.cancelCSVImport = cancelCSVImport;
window.confirmCSVImport = confirmCSVImport;
window.importCSVReplace = importCSVReplace;
window.parseCSVFile = parseCSVFile;
window.updateOnlineStatus = updateOnlineStatus;
window.showUserGuide = showUserGuide;
window.closeUserGuide = closeUserGuide;
window.showAboutDeveloper = showAboutDeveloper;
window.closeAboutDeveloper = closeAboutDeveloper;
window.calcVolume = calcVolume;
window.calculateFormFactorVolume = calculateFormFactorVolume;
window.calculateConicVolume = calculateConicVolume;
window.getSpeciesByName = getSpeciesByName;
window.getAllSpeciesNames = getAllSpeciesNames;
window.updateExportButton = updateExportButton;
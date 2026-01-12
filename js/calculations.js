// Calculation Functions
/**
 * Calculate volume using Form Factor method
 * V = (π × D² × H × F) / 4
 * where F = 0.5
 */
function calculateFormFactorVolume(diameter, height) {
  // Convert diameter from cm to m
  const D = diameter / 100;
  const H = height;
  const F = 0.5;
  return (Math.PI * D * D * H * F) / 4;
}

/**
 * Calculate volume using Conic Formula method
 * V = (π × H × DBH²) / (3 × 200²)
 */
function calculateConicVolume(diameter, height) {
  // Convert diameter from cm to m
  const D = diameter / 100;
  const H = height;
  return (Math.PI * H * D * D) / 12;
}

/**
 * Main volume calculation function
 */
function calcVolume() {
  const D = parseFloat(document.getElementById('dbh').value);
  const H = parseFloat(document.getElementById('height').value);
  const minD = parseFloat(document.getElementById('minDiam').value);
  const method = document.getElementById('volMethod').value;
  const quality = document.getElementById('quality').value;
  
  // Validation checks
  if (!D || !H) {
    alert('Please enter both DBH and Height');
    return;
  }
  
  // Check quality allows calculation
  if (quality !== '1' && quality !== '2') {
    alert('Volume can only be calculated for Quality 1 (Perfect) or 2 (Slight Defect)');
    return;
  }
  
  let vol = 0;
  if (method === 'form') {
    vol = calculateFormFactorVolume(D, H);
  } else {
    vol = calculateConicVolume(D, H);
  }
  
  currentVolume = vol;
  document.getElementById('volValue').textContent = vol.toFixed(4);
  document.getElementById('volDisplay').classList.remove('hidden');
  
  // After calculating, if DBH is below minimum, force quality to 3
  if (D < minD) {
    document.getElementById('quality').value = '3';
    alert(`Volume calculated, but DBH (${D} cm) is below minimum cutting diameter (${minD} cm). Quality has been set to "3 - Unexploitable".`);
  }
}
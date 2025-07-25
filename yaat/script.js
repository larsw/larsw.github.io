// Yet Another ASCII Table - JavaScript Module
// Refactored from web component to direct DOM rendering

// Constants
const ASCII_TABLE_SIZE = 128;
const ROWS_PER_TABLE = 32;

// Special characters mapping
const specialCharacters = {
  0: ["NUL", "null"],
  1: ["SOH", "start of heading"],
  2: ["STX", "Start of text"],
  3: ["ETX", "End of text"],
  4: ["EOT", "End of transmission"],
  5: ["ENQ", "enquiry"],
  6: ["ACK", "acknowledge"],
  7: ["BEL", "bell"],
  8: ["BS", "backspace"],
  9: ["TAB", "horizontal tabulator"],
  10: ["LF", "line feed"],
  11: ["VT", "vertical tabulator"],
  12: ["FF", "form feed"],
  13: ["CR", "carriage return"],
  14: ["SO", "shift out"],
  15: ["SI", "shift in"],
  16: ["DLE", "data link escape"],
  17: ["DC1", "device control 1"],
  18: ["DC2", "device control 2"],
  19: ["DC3", "device control 3"],
  20: ["DC4", "device control 4"],
  21: ["NAK", "negative acknowledgement"],
  22: ["SYN", "synchronous idle"],
  23: ["ETB", "end of transmission block"],
  24: ["CAN", "cancel"],
  25: ["EM", "end of medium"],
  26: ["SUB", "substitute"],
  27: ["ESC", "escape"],
  28: ["FS", "file separator"],
  29: ["GS", "group separator"],
  30: ["RS", "record separator"],
  31: ["US", "unit separator"],
  32: ["SP", "space"],
  127: ["DEL", "delete"],
};

// Global state
let cellCache = null;
let currentHighlightColor = "#ff00ff";

// Utility functions
const getBooleanFromStorage = (key, defaultValue = true) => {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === "true" : defaultValue;
  } catch (e) {
    console.warn(`Failed to read ${key} from localStorage:`, e);
    return defaultValue;
  }
};

const getStringFromStorage = (key, defaultValue = "") => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (e) {
    console.warn(`Failed to read ${key} from localStorage:`, e);
    return defaultValue;
  }
};

const setStorageValue = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage:`, e);
  }
};

// Validation utilities
const isValidHexColor = (color) => {
  return /^#[0-9a-fA-F]{6}$/.test(color);
};

const sanitizeHexColor = (color) => {
  if (!color) return "#ff00ff";
  
  // Remove any non-hex characters except #
  let sanitized = color.replace(/[^#0-9a-fA-F]/g, '');
  
  // Ensure it starts with #
  if (!sanitized.startsWith('#')) {
    sanitized = '#' + sanitized;
  }
  
  // Pad or truncate to correct length
  if (sanitized.length < 7) {
    sanitized = sanitized.padEnd(7, '0');
  } else if (sanitized.length > 7) {
    sanitized = sanitized.substring(0, 7);
  }
  
  return isValidHexColor(sanitized) ? sanitized : "#ff00ff";
};

// Debounce utility for performance
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Cache DOM elements
const domElements = {
  themeSelect: null,
  searchInput: null,
  highlightColorInput: null,
  statusBox: null,
  asciiTablesContainer: null,
  outputArea: null,
  clearButton: null,
  copyButton: null,
  exactMatch: null,
  caseSensitive: null,
  hexColor: null
};

// Initialize DOM element cache
function initializeDOMElements() {
  domElements.themeSelect = document.getElementById('theme-select');
  domElements.searchInput = document.getElementById('search');
  domElements.highlightColorInput = document.getElementById('hexColor');
  domElements.statusBox = document.getElementById('statusBox');
  domElements.asciiTablesContainer = document.getElementById('ascii-tables-container');
  domElements.outputArea = document.getElementById('output-area');
  domElements.clearButton = document.getElementById('clearOutput');
  domElements.copyButton = document.getElementById('copyOutput');
  domElements.exactMatch = document.getElementById('exactMatch');
  domElements.caseSensitive = document.getElementById('caseSensitive');
  domElements.hexColor = document.getElementById('hexColor');
}

// Status display utility
function showStatus(message, type = 'info') {
  if (!domElements.statusBox) return;
  
  domElements.statusBox.textContent = message;
  domElements.statusBox.className = `status-box status-${type}`;
  domElements.statusBox.style.display = "block";
  domElements.statusBox.classList.add("show-status");

  // Remove the class at the end of the animation to reset the state
  domElements.statusBox.addEventListener(
    "animationend",
    () => {
      domElements.statusBox.classList.remove("show-status");
      domElements.statusBox.style.display = "none";
    },
    { once: true }
  );
}

// Output area management
const outputAreaManager = {
  values: new Set(), // Use Set to avoid duplicates
  
  addValue(value) {
    this.values.add(value);
    this.updateDisplay();
  },
  
  clear() {
    this.values.clear();
    this.updateDisplay();
  },
  
  updateDisplay() {
    if (domElements.outputArea) {
      domElements.outputArea.value = Array.from(this.values).join(', ');
    }
  },
  
  async copyAll() {
    const text = domElements.outputArea.value;
    if (!text.trim()) {
      showStatus('No values to copy', 'warning');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      showStatus('All values copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showStatus('Failed to copy to clipboard', 'error');
    }
  }
};

// ASCII Table generation functions
function generateRow(dec) {
  let hex = `0x${dec.toString(16).padStart(2, "0").toUpperCase()}`;
  const oct = dec.toString(8).padStart(3, "0");
  let data = "";
  let title = "";
  if (specialCharacters[dec]) {
    data = specialCharacters[dec][0];
    title = specialCharacters[dec][1];
  } else {
    data = String.fromCharCode(dec);
  }
  dec = dec.toString().padStart(2, "0");
  const row = document.createElement("tr");
  row.innerHTML = `<td>${hex}</td>
        <td>${dec}</td>
        <td>${oct}</td>
        <td title="${title}">${data}</td>`;
  return row;
}

function generateRows(n) {
  const rows = [];
  const base = ROWS_PER_TABLE * n;
  for (let i = base; i < base + ROWS_PER_TABLE; i++) {
    rows.push(generateRow(i));
  }
  return rows;
}

function handleCellKeydown(event, currentCell) {
  const { key, ctrlKey } = event;
  
  // Get all cells from all tables for navigation
  const allCells = document.querySelectorAll(".ascii-table td");
  const currentIndex = Array.from(allCells).indexOf(currentCell);
  
  if (currentIndex === -1) return; // Cell not found
  
  let newIndex = currentIndex;
  
  // Handle Ctrl+Arrow keys for table section navigation
  if (ctrlKey) {
    if (key === 'ArrowRight') {
      // Move to the first cell of the next table section
      const cellsPerTable = ROWS_PER_TABLE * 4; // 32 rows * 4 columns = 128 cells per table
      const currentTable = Math.floor(currentIndex / cellsPerTable);
      const nextTable = (currentTable + 1) % 4; // 4 tables total
      newIndex = nextTable * cellsPerTable; // Always go to first cell of target table
    } else if (key === 'ArrowLeft') {
      // Move to the first cell of the previous table section
      const cellsPerTable = ROWS_PER_TABLE * 4; // 32 rows * 4 columns = 128 cells per table
      const currentTable = Math.floor(currentIndex / cellsPerTable);
      const prevTable = (currentTable - 1 + 4) % 4; // 4 tables total
      newIndex = prevTable * cellsPerTable; // Always go to first cell of target table
    } else {
      return; // Don't handle other Ctrl+key combinations
    }
  } else {
    // Handle regular arrow keys within the current table
    const cellsPerTable = ROWS_PER_TABLE * 4;
    const currentTable = Math.floor(currentIndex / cellsPerTable);
    const positionInTable = currentIndex % cellsPerTable;
    const tableStartIndex = currentTable * cellsPerTable;
    const tableEndIndex = tableStartIndex + cellsPerTable - 1;
    
    switch(key) {
      case 'ArrowRight':
        newIndex = Math.min(currentIndex + 1, tableEndIndex);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(currentIndex - 1, tableStartIndex);
        break;
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + 4, tableEndIndex); // 4 columns
        break;
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - 4, tableStartIndex); // 4 columns
        break;
      case 'Home':
        newIndex = tableStartIndex;
        break;
      case 'End':
        newIndex = tableEndIndex;
        break;
      default:
        return; // Don't prevent default for other keys
    }
  }
  
  if (newIndex !== currentIndex) {
    event.preventDefault();
    allCells[newIndex].focus();
  }
}

function onValueSelected(value) {
  // Add value to output area
  outputAreaManager.addValue(value);
  
  // Try to copy to clipboard with fallback
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value)
      .then(() => {
        showStatus(`${value} copied to clipboard and added to output`, 'success');
      })
      .catch(() => {
        showStatus(`${value} added to output (clipboard failed)`, 'warning');
      });
  } else {
    // Fallback for older browsers
    showStatus(`${value} added to output (manual copy required)`, 'warning');
  }
}

function generateTable(n) {
  const table = document.createElement("table");
  table.className = "ascii-table";
  table.id = `table-${n}`;
  table.setAttribute('role', 'table');
  table.setAttribute('aria-label', `ASCII table section ${n + 1}`);
  
  table.innerHTML = `
        <thead>
          <tr role="row">
            <th role="columnheader">Hex</th>
            <th role="columnheader">Dec</th>
            <th role="columnheader">Oct</th>
            <th role="columnheader">Val</th>
          </tr>
        </thead>
        <tbody></tbody>`;
  
  const tbody = table.querySelector("tbody");
  const rows = generateRows(n);
  tbody.replaceChildren(...rows);

  // Add event listeners and accessibility attributes
  const cells = Array.from(table.querySelectorAll("td"));
  cells.forEach((cell, index) => {
    // Accessibility
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `ASCII value: ${cell.textContent}`);
    
    // Event listeners
    cell.addEventListener("dblclick", () => {
      onValueSelected(cell.textContent);
    });
    
    // Keyboard navigation
    cell.addEventListener("keydown", (e) => handleCellKeydown(e, cell));
    
    // Enter key for selection
    cell.addEventListener("keypress", (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onValueSelected(cell.textContent);
      }
    });
  });

  return table;
}

// Highlight functionality
function updateHighlightColor(color) {
  currentHighlightColor = color;
  // Update CSS custom property for highlight color
  document.documentElement.style.setProperty('--highlight-color', color);
}

function highlight(value, exactMatch, caseSensitive) {
  // Cache cells on first run for better performance
  if (!cellCache) {
    cellCache = document.querySelectorAll(".ascii-table td");
  }

  if (!value || value === "") {
    cellCache.forEach(cell => cell.classList.remove("selected"));
    return;
  }

  const searchValue = caseSensitive ? value : value.toLowerCase();

  cellCache.forEach(cell => {
    const cellText = caseSensitive ? cell.textContent : cell.textContent.toLowerCase();
    const matches = exactMatch ? cellText === searchValue : cellText.includes(searchValue);
    
    if (matches) {
      cell.classList.add("selected");
    } else {
      cell.classList.remove("selected");
    }
  });
}

// Initialize ASCII tables
function initializeAsciiTables() {
  const container = domElements.asciiTablesContainer;
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  const tableCount = ASCII_TABLE_SIZE / ROWS_PER_TABLE;
  
  for (let i = 0; i < tableCount; i++) {
    const table = generateTable(i);
    container.appendChild(table);
  }
  
  // Reset cell cache after generating new tables
  cellCache = null;
}

// Event handlers
function onSearch(input) {
  highlight(input.value, domElements.exactMatch.checked, domElements.caseSensitive.checked);
}

function updateValues() {
  // Validate hex color before saving
  const colorValue = sanitizeHexColor(domElements.hexColor.value);
  domElements.hexColor.value = colorValue;
  
  // Save settings to localStorage
  setStorageValue("exactMatch", domElements.exactMatch.checked);
  setStorageValue("caseSensitive", domElements.caseSensitive.checked);
  setStorageValue("hexColor", colorValue);

  // Update highlight color
  updateHighlightColor(colorValue);
  
  onSearch(domElements.searchInput);
}

function handleHexColorInput() {
  // Real-time validation feedback
  const input = domElements.hexColor;
  const isValid = isValidHexColor(input.value) || input.value === '';
  
  if (isValid) {
    input.style.borderColor = '#ccc';
    input.title = 'Enter a valid hex color (e.g., #ff00ff)';
    updateValues();
  } else {
    input.style.borderColor = '#ff6b6b';
    input.title = 'Invalid hex color format. Use #RRGGBB format.';
  }
}

function validateHexColorOnBlur() {
  const input = domElements.hexColor;
  const sanitized = sanitizeHexColor(input.value);
  if (input.value !== sanitized) {
    input.value = sanitized;
    input.style.borderColor = '#ccc';
    updateValues();
  }
}

function handleSearchKeydown(e) {
  if (e.key === 'Escape') {
    e.target.value = '';
    onSearch(e.target);
  }
}

function handleGlobalKeydown(e) {
  // Global keyboard shortcuts
  if (e.ctrlKey || e.metaKey) {
    switch(e.key) {
      case 'f':
      case 'F':
        e.preventDefault();
        domElements.searchInput.focus();
        domElements.searchInput.select();
        break;
      case 'ArrowRight':
      case 'ArrowLeft':
        // Handle table navigation when no cell is currently focused
        const activeElement = document.activeElement;
        const isTableCell = activeElement && activeElement.matches('.ascii-table td');
        
        if (!isTableCell) {
          e.preventDefault();
          // Select the first cell of the first table
          const firstCell = document.querySelector('.ascii-table td');
          if (firstCell) {
            firstCell.focus();
          }
        }
        break;
    }
  }
}

// Main initialization function
function onLoad() {
  // Initialize DOM element cache
  initializeDOMElements();

  // Initialize ASCII tables
  initializeAsciiTables();

  // Restore settings from localStorage with validation
  domElements.exactMatch.checked = getBooleanFromStorage("exactMatch", true);
  domElements.caseSensitive.checked = getBooleanFromStorage("caseSensitive", true);
  
  const savedColor = getStringFromStorage("hexColor", "#ff00ff");
  const validatedColor = sanitizeHexColor(savedColor);
  domElements.hexColor.value = validatedColor;

  updateHighlightColor(validatedColor);
  domElements.searchInput.focus();

  // Add event listeners with debounced search
  const debouncedSearch = debounce(() => onSearch(domElements.searchInput), 100);
  domElements.searchInput.addEventListener('input', debouncedSearch);
  domElements.searchInput.addEventListener('keydown', handleSearchKeydown);
  
  domElements.exactMatch.addEventListener('change', updateValues);
  domElements.caseSensitive.addEventListener('change', updateValues);
  domElements.hexColor.addEventListener('input', handleHexColorInput);
  domElements.hexColor.addEventListener('blur', validateHexColorOnBlur);
  
  // Output area event listeners
  domElements.outputArea.addEventListener('dblclick', () => outputAreaManager.copyAll());
  domElements.clearButton.addEventListener('click', () => {
    outputAreaManager.clear();
    showStatus('Output area cleared', 'success');
  });
  domElements.copyButton.addEventListener('click', () => outputAreaManager.copyAll());
  
  // Add keyboard navigation support
  document.addEventListener('keydown', handleGlobalKeydown);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onLoad);
} else {
  onLoad();
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Data structure for caching
const cache = {
  students: null,
  attendance: null,
  lastUpdate: null,
  filteredStudents: {},
  clearCache: function() {
    this.students = null;
    this.attendance = null;
    this.lastUpdate = null;
    this.filteredStudents = {};
  }
};

// Error handler
class AppError extends Error {
  constructor(message, type = 'error') {
    super(message);
    this.name = 'AppError';
    this.type = type;
  }
}

// Data validation functions
const validators = {
  name: (value) => {
    if (!value) return "Name is required";
    if (value.length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "Name can only contain letters and spaces";
    return null;
  },
  phone: (value) => {
    if (!value) return "Phone number is required";
    if (!/^\d{4}-\d{7}$/.test(value)) return "Phone format should be 03XX-XXXXXXX";
    return null;
  },
  class: (value) => {
    if (!value) return "Class is required";
    if (isNaN(value) || value < 1 || value > 10) return "Invalid class";
    return null;
  }
};

// Save data with retry mechanism
async function saveWithRetry(key, data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return false;
}

// Month utilities
const monthUtils = {
  getMonthName: (month) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
  },
  formatMonth: (year, month) => {
    return `${year}-${month.toString().padStart(2, '0')}`;
  },
  getCurrentMonth: () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  }
};

export {
  debounce,
  cache,
  AppError,
  validators,
  saveWithRetry,
  monthUtils
};

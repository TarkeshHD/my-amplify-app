export const applyPagination = (documents, page, rowsPerPage) => {
  return documents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
};

export const getInitials = (name = '') =>
  name
    .replace(/\s+/, ' ')
    .split(' ')
    .slice(0, 2)
    .map((v) => v && v[0].toUpperCase())
    .join('');

export const getFile = (path) => {
  if (!path) {
    return;
  }
  return `${import.meta.env.VITE_BASE_URL}file/${path}`;
};

export const capitalizeFirstLetter = (word) => {
  // Check if the input is a valid string
  if (typeof word !== 'string' || word.length === 0) {
    return word;
  }

  return word.charAt(0).toUpperCase() + word.slice(1);
};

export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) {
    // Handle the case where oldValue is zero to avoid division by zero
    if (newValue === 0) {
      return 0;
    } else {
      // If old value is zero and new value is non-zero, consider it as an infinite increase
      return 100;
    }
  }

  const change = newValue - oldValue;
  const percentageChange = (change / Math.abs(oldValue)) * 100;
  return percentageChange.toFixed(0);
};

// Format bytes to kb, mb or gb
export const formatBytes = (bytes) => {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1048576) {
    return (bytes / 1024).toFixed(0) + ' KB';
  } else if (bytes < 1073741824) {
    return (bytes / 1048576).toFixed(0) + ' MB';
  } else {
    return (bytes / 1073741824).toFixed(0) + ' GB';
  }
};

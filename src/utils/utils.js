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

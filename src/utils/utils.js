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

export const getFile = (path) => `${import.meta.env.VITE_BASE_URL}file/${path}`;

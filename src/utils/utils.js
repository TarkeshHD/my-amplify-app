import moment from 'moment-timezone';
import axios from './axios';
import { read, utils } from 'xlsx';
import { toast } from 'react-toastify';

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
  return `${path}`;
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

export const fetchScoresAndStatuses = async (item, config) => {
  let score = '-';
  let status = 'Pending';

  if (item?.endTime || item?.mode === 'jsonLifeCycle') {
    status = await getStatus(item, config);
    score = status === 'Fail' && item?.mode === 'time' ? '-' : getScore(item); // If the status is fail and the mode is time, then the score should be "-"
    score = item?.mode === 'jsonLifeCycleBased' ? getScore(item) : score;
  }

  return { ...item, score, status };
};

export const getStatus = async (item, config) => {
  // const response = await axios.get(`/evaluation/${item.id}`);
  if (item?.mode === 'mcq') {
    // Get the percentage and find the pass mark
    const passMark = item?.evaluationDump.mcqBased.length * (item.passingCriteria.passPercentage / 100);
    return item?.answers?.mcqBased?.score >= passMark ? 'Pass' : 'Fail';
  } else if (item?.mode === 'questionAction') {
    let fullScore = 0;
    item?.evaluationDump.questionActionBased.forEach((question) => {
      fullScore += question.weightage;
    });
    const passMark = fullScore * (item.passingCriteria.passPercentage / 100);
    return item?.answers?.questionActionBased?.score >= passMark ? 'Pass' : 'Fail';
  } else if (item?.mode === 'time') {
    // If time taken is less than eval dump bronze time and if mistakes are less than passing criteria mistakes allowed; then pass
    return item.answers?.timeBased.timeTaken < item?.evaluationDump.timeBased.bronzeTimeLimit &&
      item.answers?.timeBased?.mistakes?.length <= item.passingCriteria.mistakesAllowed
      ? 'Pass'
      : 'Fail';
  } else if (item?.mode === 'jsonLifeCycle') {
    return item?.evaluationDump?.jsonLifeCycleBased?.status;
  }
};

export const getScore = (item) => {
  if (item?.mode === 'mcq') {
    return item?.answers?.mcqBased?.score + ' / ' + item?.answers?.mcqBased?.answerKey.length;
  } else if (item?.mode === 'questionAction') {
    // Loop through thee evaluation dump and calculate the weightage to get full score
    let fullScore = 0;
    item?.evaluationDump.questionActionBased.forEach((question) => {
      fullScore += question.weightage;
    });
    return item?.answers?.questionActionBased?.score + '/' + fullScore;
  } else if (item?.mode === 'time') {
    return capitalizeFirstLetter(item?.answers?.timeBased?.score);
  } else if (item?.mode === 'jsonLifeCycle') {
    return `${item?.evaluationDump?.jsonLifeCycleBased?.totalScored || 0} / ${
      item?.evaluationDump?.jsonLifeCycleBased?.totalMark || 0
    }`;
  }
};

export const addToHistory = () => {
  // Get existing history from sessionStorage
  const existingHistory = JSON.parse(sessionStorage.getItem('history')) || [];
  // Append the current page URL to the history array
  const updatedHistory = [...existingHistory, window.location.pathname];
  // Update the 'history' key in sessionStorage
  sessionStorage.setItem('history', JSON.stringify(updatedHistory));
};

export const removeFromHistory = () => {
  // Get existing history from sessionStorage
  const existingHistory = JSON.parse(sessionStorage.getItem('history')) || [];
  // Remove the last element from the history array
  const removedElement = existingHistory.pop();
  // Update the 'history' key in sessionStorage
  sessionStorage.setItem('history', JSON.stringify(existingHistory));

  return removedElement;
};

export const convertTimeToDescription = (time, minify = false) => {
  let formattedDuration = '';

  if (time === 0) return '0 seconds';

  const duration = moment.duration(time, 'seconds');

  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  // If minify is true, return the minified version of the duration
  if (hours > 0) {
    if (minify) {
      return (formattedDuration += `${hours}h`);
    }
    formattedDuration += `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0 || seconds > 0) {
      if (minify) {
        return (formattedDuration += ` ${minutes}m`);
      }
      formattedDuration += ` ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    if (seconds > 0) {
      if (minify) {
        return ` ${seconds}s`;
      }
      formattedDuration += ` ${seconds} second${seconds > 1 ? 's' : ''}`;
    }
  } else if (minutes > 0) {
    formattedDuration += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (seconds > 0) {
      formattedDuration += ` ${seconds} second${seconds > 1 ? 's' : ''}`;
    }
  } else {
    formattedDuration += `${seconds} second${seconds > 1 ? 's' : ''}`;
  }

  return formattedDuration;
};

export const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: 'array' });
      resolve(workbook);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const getItemWithExpiration = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = moment().unix();
  if (now > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
};

export const setItemWithExpiration = (key, value, timeout) => {
  const now = moment().unix();

  // `item` is an object which contains the original value
  // plus the expiration time
  const item = {
    value: value,
    expiry: now + timeout,
  };

  // Store the item as a string
  localStorage.setItem(key, JSON.stringify(item));
};

export const setToastWithExpiration = (message, timeout) => {
  const defaultKey = 'toastMessage';
  const now = moment().unix();
  const item = {
    message,
    expiry: now + timeout,
  };
  localStorage.setItem(defaultKey, JSON.stringify(item));
};
export const displayPendingToast = () => {
  const defaultKey = 'toastMessage';
  const itemStr = localStorage.getItem(defaultKey);
  if (!itemStr) {
    return;
  }
  const item = JSON.parse(itemStr);
  const now = moment().unix();
  if (now <= item.expiry) {
    toast(item.message);
    // Remove the toast message from localStorage after displaying it
    localStorage.removeItem(defaultKey);
  }
};

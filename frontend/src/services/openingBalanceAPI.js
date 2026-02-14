import api from './api'; // your existing axios instance

export const openingBalanceAPI = {
  create: (entries) =>
    api.post('/opening-balance', { entries }),
};

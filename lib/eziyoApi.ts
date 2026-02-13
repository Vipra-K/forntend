import axios from 'axios';

const eziyoApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EZIYO_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

export default eziyoApi;

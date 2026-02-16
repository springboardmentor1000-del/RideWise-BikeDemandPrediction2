import axios from "axios";

const API = "http://localhost:5000/api/reservations";

export const createReservation = (data) =>
  axios.post(`${API}/create`, data);

export const getMyReservations = (userId) =>
  axios.get(`http://localhost:5000/api/reservations/my/${userId}`);

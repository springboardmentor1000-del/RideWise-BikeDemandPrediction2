import { createContext, useContext, useState } from "react";

const ReservationContext = createContext(null);

export function ReservationProvider({ children }) {
  const [reservations, setReservations] = useState([]);

  const addReservation = (booking) => {
    setReservations((prev) => [...prev, booking]);
  };

  const cancelReservation = (id) => {
    setReservations((prev) => prev.filter(b => b.id !== id));
  };

  return (
    <ReservationContext.Provider
      value={{ reservations, addReservation, cancelReservation }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export const useReservations = () => {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error("useReservations must be inside ReservationProvider");
  return ctx;
};

import api from "./api";

/**
 * Send message to RideWise AI backend
 */
export const sendChatMessage = async (message) => {
  const res = await api.post("/predict/chat", {
    message,
  });

  return res.data.reply;
};

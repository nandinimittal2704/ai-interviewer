export const sendSuccess = (res, status = 200, data) => res.status(status).json(data);

export const sendError = (res, status, message, details) => {
  const payload = { message };
  if (details) payload.details = details;
  return res.status(status).json(payload);
};

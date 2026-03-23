import { io } from "socket.io-client";

import { getToken } from "@/lib/auth";

function getSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  if (import.meta.env.DEV && import.meta.env.VITE_DEV_BACKEND_URL) {
    return import.meta.env.VITE_DEV_BACKEND_URL;
  }

  return window.location.origin;
}

export function createAppSocket() {
  return io(getSocketUrl(), {
    transports: ["websocket"],
    auth: {
      token: getToken(),
    },
  });
}

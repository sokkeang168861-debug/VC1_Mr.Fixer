import axios from "axios";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// if there's already a stored token, set the header so requests are authenticated by default
const storedToken = localStorage.getItem("token");
if (storedToken) {
  httpClient.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}

export default httpClient;

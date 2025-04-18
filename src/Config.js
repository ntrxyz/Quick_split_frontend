export const getAuthToken = () => {
  return localStorage.getItem("token"); // Ensure consistency
};  

const config = {
  backendUrl: "https://quick-split-backend.onrender.com/api", // Update this when deploying
};

export default config;

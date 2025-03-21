export const getAuthToken = () => {
  return localStorage.getItem("token"); // Ensure consistency
};  

const config = {
  backendUrl: "http://localhost:8080/api", // Update this when deploying
};

export default config;

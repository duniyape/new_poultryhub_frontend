
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useLoader } from "../context/LoaderContext";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

const useApi = () => {
  //   const [data, setData] = useState(null);
  //   const [error, setError] = useState(null);
  const { showLoader, hideLoader } = useLoader(); // Use global loader

  const getData = useCallback(async (endpoint, config = {}) => {
    console.log(`${API_BASE_URL}${endpoint}`)
    showLoader(); // Show loader when request starts
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        ...config,
      });
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      throw err; // Re-throw error for further handling if needed
    } finally {
      hideLoader(); // Hide loader when request ends
    }
  }, []);

  const postData = async (endpoint, postData, config = {}) => {
    showLoader(); // Show loader when request starts
    console.log(`${API_BASE_URL}${endpoint}`, postData);
    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, postData, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          ...config.headers,
        },
        ...config,
      });
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      throw err
    } finally {
      hideLoader(); // Hide loader when request ends
    }
  };


  const UpdateData = async (endpoint, postData, config = {}) => {
    showLoader(); // Show loader when request starts
    console.log(`${API_BASE_URL}${endpoint}`, postData);
    try {
      const response = await axios.patch(`${API_BASE_URL}${endpoint}`, postData, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          ...config.headers,
        },
        timeout: 10000,
        ...config,
      });
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
    } finally {
      hideLoader(); // Hide loader when request ends
    }
  };

  return { getData, postData, UpdateData };
};

export default useApi;


// import axios from 'axios';
import api from './api';
import { authHeader } from './auth';

const API_URL = 'http://localhost:8000/api/storage';

export const getFiles = (userId = null) => {
  const params = userId ? { user_id: userId } : {};
  return axios.get(`${API_URL}/files/`, { 
    headers: authHeader(),
    params
  });
};

export const uploadFile = (file, comment, isPublic) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('comment', comment);
  formData.append('is_public', isPublic);
  
  return api.post(`${API_URL}/files/`, formData, {
    headers: {
      ...authHeader(),
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const deleteFile = (id) => {
  return axios.delete(`${API_URL}/files/${id}/`, {
    headers: authHeader()
  });
};

export const updateFile = (id, data) => {
  return api.patch(`${API_URL}/files/${id}/`, data, {
    headers: authHeader()
  });
};
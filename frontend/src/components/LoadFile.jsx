// import React,{useState} from 'react'
import axios from 'axios'

const loadFile = async (e) => {
    console.log(e);
    // e.preventDefault();
    const formData = new FormData();
    formData.append("file", e.target.file.files[0]);
    formData.append("comment", e.target.comment.value);
    await axios.post('/api/load', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export default loadFile

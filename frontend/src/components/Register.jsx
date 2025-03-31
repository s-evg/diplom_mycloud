// import React,{useState} from 'react'
import axios from 'axios'

const Register = () => {
    const handleSubmit = async (e) => {
        // e.preventDefault();
        const data = {
            username: e.target.username.value,
            email: e.target.email.value,
            password: e.target.password.value,
        };
        await axios.post('/api/register', data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="username" placeholder="Имя пользователя" required />
            <input name="email" placeholder="Email" required />
            <input name="password" placeholder="Пароль" type="password" required />
            <button type="submit">Регистрация</button>
        </form>
    );
};

export default Register
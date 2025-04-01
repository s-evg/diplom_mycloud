import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/api/'
const LOGIN_URL = `${BASE_URL}token/`
const REFRESH_URL = `${BASE_URL}token/refresh/`
const FILES_URL = `${BASE_URL}files/`
const LOGOUT_URL = `${BASE_URL}logout/`
const AUTHENTICATED_URL = `${BASE_URL}authenticated/`
const REGISTER_URL = `${BASE_URL}register/`


axios.defaults.withCredentials = true; 

// Делаем запрос с учетными данными

// export const login = async (username, password) => {
//   const response = await axios.post(LOGIN_URL,
//     {username:username, password:password},
//     { withCredentials: true}
//   )
//   return response.data.success
// }
// axios.defaults.withCredentials = true; 

// Делаем запрос с учетными данными
export const login = async (username, password) => {
    try {
        const response = await axios.post(
            LOGIN_URL, 
            { username, password },  
            { withCredentials: true }
        );
        
        
        return response.data
    } catch (error) {
        console.error("Вход не удался:", error);
        return false;  
    }
};
// Обновляем токен если на момент попытки получения списка файлов срок дейстивя токена истек
export const refresh_token = async () => {
  try {
    await axios.post(REFRESH_URL,
      {},
      { withCredentials:true }
    )
    return true
  } catch(error) {
    return false
  }
  
}
// Пробуем получить список файлов под аутентификацией, если выдаст ошибку будем смотреть был ли у нас токен ранее и у него просто истек срок,
// тогда делаем запрос на его обновление, или же отказываем показывать файлы.
export const get_files = async () =>{
  try {
    const response = await axios.get(FILES_URL,
      {withCredentials: true}
    )
    return response.data
  } catch(error) {
      return call_refresh(error, axios.get(FILES_URL, {withCredentials:true}))
  }
}

// Проверяем истек ли срок действия токена или же пользователь не аутентифицирован
export const call_refresh = async (error, func) => {
  if (error.response && error.response.status === 401){
    const tokenRefreshed = await refresh_token();
    //  Если токен уже выдавался, то пробуем сделает его объявление
    if(tokenRefreshed) {
      const retryResponse = await func();
      return retryResponse.data
    }
  }
  // Если токен ранее не выдавался
  return false;
}

export const logout = async () => {
  try {
    await axios.post(LOGOUT_URL,
      {},
      {withCredentials:true}
    )
    return true
  } catch(error) {
    return false
  }

}

export const authenticated_user = async () => {
  const response = await axios.get(AUTHENTICATED_URL, { withCredentials: true });
  return response.data
}

export const register = async (username, email, password) => {
  const response = await axios.post(REGISTER_URL,
    {username:username, email:email, password:password},
    { withCredentials: true}
  )
  return response.data
}
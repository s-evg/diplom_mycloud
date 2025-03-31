import { useState, useEffect } from 'react'

function App() {
  const [ firstName, setFirstName] = useState('')
  const [ lastName, setLastName] = useState('')
  const [ username, setUsername] = useState('')
  const [ email, setEmail] = useState('')
  const [ dateJoined, setDateJoined] = useState('')
  const [ error, setError] = useState()

  useEffect(() => {
    fetch('/api/user')
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw Error(`Something went wrong: code ${response.status}`)
        }
      })
      .then(({data}) => {
        setFirstName(data.first_name)
        setLastName(data.last_name)
        setUsername(data.username)
        setEmail(data.email)
        setDateJoined(data.date_joined)
      })
      .catch(error => {
        console.log(error)
        setError('Ошибка, подробности в консоли')
      })
  }, [])

  return (
    <div className="App">
      {error?
        <p>{error}</p>
      :
        <div className="Profile">
          <h1>{firstName} {lastName}</h1>
          <h2>{username}</h2>
          <p>email: {email}</p>
          <p>Профиль создан {dateJoined}</p>
        </div>
      }
    </div>
  );}

export default App;
// function App() {

//   const [access, setAccess] = useState(localStorage.getItem('accessToken'))
//   const [refresh, setRefresh] = useState(localStorage.getItem('refreshToken'))
//   const [refreshRequired, setRefreshRequired] = useState(false)
//   const [loading, setLoading] = useState()
//   const [formUsername, setFormUsername] = useState()
//   const [formPassword, setFormPassword] = useState()
//   const [ email, setEmail] = useState('')
//   const [ dateJoined, setDateJoined] = useState('')
//   const [ error, setError] = useState()
  
  
//      useEffect(() => {
//       if (access) {
//        fetch(
//            '/api/user',
//            {
//            headers: {
//              'Content-Type': 'application/json;charset=utf-8',
//              'Authorization': `Bearer ${access}`,
//            },
//          }
//        )
  
//            if (response.ok) {
//              return response.json()
//            } else {
//             if (response.status === 401) {
//               throw Error('refresh')
//             }
//              throw Error(`Ошибка: код ${response.status}`)
//             }
//           })
  
//            setError(null)
//          })
//          .catch(error => {
  
//           if (error.message === 'refresh') {
//             setRefreshRequired(true)
//           } else {
//             console.log(error)
//             setError('Ошибка, подробности в консоли')
//           }
//          })
//        }
  
//     }, [access])
  
  
//     useEffect(() => {
//       if (refreshRequired) {
//       fetch(
//           '/api/token/refresh',
//           {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json;charset=utf-8',
//           },
//           body: JSON.stringify({ refresh })
//         }
//       )
//         .then(response => {
//           if (response.ok) {
//             return response.json()
//           } else {
//             throw Error(`Ошибка: код ${response.status}`)
//           }
//         })
//         .then(({access, refresh}) => {
//           localStorage.setItem('accessToken', access)
//           setAccess(access)
//           localStorage.setItem('refreshToken', refresh)
//           setRefresh(refresh)
//           setError(null)
//         })
//         .catch(error => {
//           console.log(error)
//           setError('Ошибка, подробности в консоли')
//         })
//       }
//     }, [refreshRequired])
  
//      const submitHandler = e => {
//        e.preventDefault();
//        setLoading(true);
//        fetch(
  
//         '/api/token/obtain',
//          {
//            method: 'POST',
//            headers: {
//              'Content-Type': 'application/json;charset=utf-8',
//            },
//            body: JSON.stringify({
//              username: formUsername,
//            }
//              throw Error(`Ошибка: код ${response.status}`)
           
//          })
  
//         .then(({access, refresh}) => {
//           localStorage.setItem('accessToken', access)
//           setAccess(access)
//           localStorage.setItem('refreshToken', refresh)
//           setRefresh(refresh)
//            setError(null)
//          })
//          .catch(error => {
  
//      return (
//        <div className="App">
//          {error? <p>{error}</p> : null}
  
//         {!access?
//            loading? "Загрузка..." :
//            <form className="loginForm" onSubmit={submitHandler}>
//              <input type="text" name="username" value={formUsername} onChange={e => setFormUsername(e.target.value)} placeholder="Username"/>
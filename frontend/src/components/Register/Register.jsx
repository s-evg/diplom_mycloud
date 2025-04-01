import {FormControl, FormLabel, Button, VStack, Input, Text} from '@chakra-ui/react'
import { useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { useNavigate } from 'react-router-dom';

export const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const { registerUser } = useAuth();
  const nav = useNavigate();

  const handleRegister = async () => {
      await registerUser(username, email, password, passwordConfirm)
  }

  const handleNavigate = () => {
      nav('/login')
  }

  return (
      <VStack>
          <Text fontSize='44px' fontWeight='bold'>Регистрация</Text>
          <FormControl mb='20px'>
              <FormLabel>Имя</FormLabel>
              <Input bg='white' onChange={(e) => setUsername(e.target.value)} value={username} type='text' placeholder='Введите ваше имя' />
          </FormControl>
          <FormControl mb='20px'>
              <FormLabel>Email</FormLabel>
              <Input  bg='white' onChange={(e) => setEmail(e.target.value)} value={email} type='email' placeholder='Введите ваш email' />
          </FormControl>
          <FormControl mb='20px'>
              <FormLabel>Пароль</FormLabel>
              <Input  bg='white' onChange={(e) => setPassword(e.target.value)} value={password} type='password' placeholder='Введите пароль' />
          </FormControl>
          <FormControl>
              <FormLabel>Подтверждение пароля</FormLabel>
              <Input bg='white' onChange={(e) => setPasswordConfirm(e.target.value)} value={passwordConfirm} type='password' placeholder='Повторите пароль' />
          </FormControl>
          <Button colorScheme='green' onClick={handleRegister}>Регистрация</Button>
          <Text onClick={handleNavigate} cursor='pointer' color='gray.600' fontSize='14px'>Уже есть аккаунт? Войти</Text>
      </VStack>
  )
}

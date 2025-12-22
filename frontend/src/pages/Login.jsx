import React from 'react'
import { useState, useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Login = () => {
  const [currentState, setCurrentState] = useState('Login')
  const { token, setToken, navigate, backendUrl, getUserCart } =
    useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          toast.success("Registered successfully!");
        } else {
          toast.error(response.data.message);
        }
      } else if (currentState === "Login") {
        const response = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          toast.success("Logged in successfully!");
          getUserCart(response.data.token);
        } else {
          toast.error(response.data.message);
        }
      } else if (currentState === "Forgot Password") {
        // Reset password directly
        const response = await axios.post(
          backendUrl + "/api/user/reset-password",
          {
            email,
            newPassword,
          }
        );
        if (response.data.success) {
          toast.success("Password reset successfully!");
          setCurrentState("Login");
          setNewPassword("");
        } else {
          toast.error(response.data.message || "Failed to reset password");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "An error occurred");
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token, navigate])

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
      
      {/* Conditional rendering based on the current state */}
      {currentState === 'Sign Up' && (
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Name"
          required
        />
      )}
      
      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
      />
      
      {currentState === 'Login' && (
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Password"
          required
        />
      )}
      
      {currentState === 'Sign Up' && (
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Password"
          required
        />
      )}
      
      {/* New Password input for reset */}
      {currentState === 'Forgot Password' && (
        <input
          onChange={(e) => setNewPassword(e.target.value)}
          value={newPassword}
          type="password"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="New Password"
          required
        />
      )}
      
      <div className="w-full flex justify-between text-sm mt-[-8px]">
        {currentState !== 'Forgot Password' ? (
          <p 
            className="cursor-pointer" 
            onClick={() => setCurrentState('Forgot Password')}
          >
            Forgot Your Password?
          </p>
        ) : (
          <p 
            className="cursor-pointer" 
            onClick={() => setCurrentState('Login')}
          >
            Back to Login
          </p>
        )}
        
        {currentState === 'Login' ? (
          <p 
            onClick={() => setCurrentState('Sign Up')} 
            className="cursor-pointer"
          >
            Create Account
          </p>
        ) : currentState === 'Sign Up' ? (
          <p 
            onClick={() => setCurrentState('Login')} 
            className="cursor-pointer"
          >
            Login Here
          </p>
        ) : null}
      </div>
      
      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === 'Login' 
          ? 'Sign In' 
          : currentState === 'Sign Up' 
            ? 'Sign Up' 
            : 'Reset Password'}
      </button>
    </form>
  )
}

export default Login
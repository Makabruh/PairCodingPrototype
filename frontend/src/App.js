import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import LinkPage from './components/LinkPage';
import Layout from './components/Layout';
import Unauthorized from './components/Unauthorized';
import RequireAuth from './components/RequireAuth';
import { Routes, Route } from 'react-router-dom';

import axios from './api/axios';
import AuthContext from "./context/AuthProvider"



function App(){
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
          {/* public routes  */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="linkpage" element={<LinkPage />} />
          <Route path="unauthorized" element={<Unauthorized />} />

          {/* we want to protect these routes */}
          <Route element={<RequireAuth />}>
              <Route path="/" element={<Home />} />
          </Route>
 
      </Route>
    </Routes>
    );
}


export default App;

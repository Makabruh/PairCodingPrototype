import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import LinkPage from './components/LinkPage';
import CurrentUser from './components/User';
import Query from './components/Query';
import Employer from './components/Employer';
import Apprentice from './components/Apprentice';
import TrainingProvider from './components/TrainingProvider';
import Layout from './components/Layout';
import Unauthorized from './components/Unauthorized';
import RequireAuth from './components/RequireAuth';
import PasswordReset from './components/PasswordReset';
import ForgotPassword from './components/ForgotPassword';
import VerifyUser from './components/VerifyUser';
import { Routes, Route } from 'react-router-dom';



function App(){
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes  */}
        <Route path="login" element={<Login />} />
        <Route path="query" element={<Query />} />
        <Route path="register" element={<Register />} />
        <Route path="linkpage" element={<LinkPage />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="forgotpassword" element={<ForgotPassword />} />
        <Route path="resetpassword" element={<PasswordReset />} />
        {/* For security purposes - this may need to be a hashed username in the future */}
        <Route path="verifyuser/:username" element={<VerifyUser />} />

        {/* we want to protect these routes */}
        <Route element={<RequireAuth allowedRoles={["AnyUser"]}/>}>
          <Route path="/" element={<Home />} />
          <Route path="user" element={<CurrentUser />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={["Employer"]}/>}>
          <Route path="employer" element={<Employer />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={["TrainingProvider"]}/>}>
          <Route path="trainingprovider" element={<TrainingProvider />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={["Apprentice"]}/>}>
          <Route path="apprentice" element={<Apprentice />} />
        </Route>
 
      </Route>
    </Routes>
    );
}


export default App;

import {Route,Routes, BrowserRouter} from 'react-router-dom';
import App from './App';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import Navbar from './Navbar';
import Mappings from './Mappings';
import Mapping from './Mapping';
import NewAlbum from './newAlbum';
import Albums from './Albums';
import Album from './Album';
import Login from './Login';
import LoginHandler from './LoginHandler';
import Admin from './Admin';

import { useState,useEffect } from 'react';
import { Auth } from './Endpoints';

import { Box,LinearProgress } from '@mui/material';
function LinearIndeterminate() {
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress />
    </Box>
  );
}

const MyRoutes = () => {

    

    const [menuItems, setMenuItems] = useState({
      home: {
        label: 'Home',
        href: '/',
        icon: <HomeIcon />,
      },
      about: {
        label: 'Mapping',
        href: '/mappings',
        icon: <InfoIcon />,
      },

      albums: {
        label: 'Albums',
        href: '/album',
        icon: <ContactMailIcon />,
      },
      login: {
        label: 'Login',
        href: '/login',
        icon: <AccountBoxIcon />,
      }
    });

    const { token, infoDialog } = Auth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // console.log("Token: ",token);
      if(token){
        var newMenuItems = {...menuItems};
        delete newMenuItems.login;
        console.log("Menu Items: ",newMenuItems);
        setMenuItems(newMenuItems);
      }
      
      setTimeout(() => setLoading(false), 1000);

      },[token]);
      

 
      

    return (
        <BrowserRouter>
        {loading && <LinearIndeterminate />}
        <Navbar menuItems={menuItems} />
            <Routes>
                <Route path="/" element={<App/>} />
                <Route path="/mappings" element={<Mappings/>} />
                <Route path="/mappings/:slug" element={<Mapping/>} />
                <Route path="/album/new" element={<NewAlbum/>} />
                <Route path="/album" element={<Albums/>} />
                <Route path="/album/:album_id" element={<Album/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/admin" element={<Admin/>} />
            </Routes>
        </BrowserRouter>
    );
};

export default MyRoutes;
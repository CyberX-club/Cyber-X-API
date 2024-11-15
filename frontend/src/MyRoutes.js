import {Route,Routes, BrowserRouter} from 'react-router-dom';
import App from './App';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import Navbar from './Navbar';
import Mappings from './Mappings';
import Mapping from './Mapping';
import NewAlbum from './newAlbum';


const MyRoutes = () => {

    const menuItems = {
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
        newAlbum: {
          label: 'New Album',
          href: '/newAlbum',
          icon: <ContactMailIcon />,
        },
      };
      

    return (
        <BrowserRouter>
        <Navbar menuItems={menuItems} />
            <Routes>
                <Route path="/" element={<App/>} />
                <Route path="/mappings" element={<Mappings/>} />
                <Route path="/mappings/:slug" element={<Mapping/>} />
                <Route path="/newAlbum" element={<NewAlbum/>} />
            </Routes>
        </BrowserRouter>
    );
};

export default MyRoutes;
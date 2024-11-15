// Navbar.js
import React from 'react';
import { AppBar, Toolbar, Button, IconButton, Typography, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for routing
import PropTypes from 'prop-types';

const Navbar = ({ menuItems }) => {
  const theme = useTheme();

  return (
    <AppBar position="sticky" sx={{ mb: 2 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          MyApp
        </Typography>
        <Stack direction="row" spacing={2}>
          {Object.keys(menuItems).map((key) => {
            const item = menuItems[key];

            return (
              <Button
                key={key}
                component={Link}
                to={item.href}
                startIcon={item.icon}
                sx={{
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

Navbar.propTypes = {
  menuItems: PropTypes.object.isRequired, // menuItems should be an object
};

export default Navbar;

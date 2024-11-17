import React, { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  LinearProgress,
  Box
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import LoginHandler from './LoginHandler';
import Endpoints from './Endpoints';
import InfoDialog from './Dialog';

const Admin = () => {
  const [adminEmails, setAdminEmails] = useState([]);
  const [token, setToken] = useState("");
  const [newEmails, setNewEmails] = useState(""); // Will store comma-separated emails
  const [infoDialogData, setInfoDialogData] = useState({ 
    open: false, 
    title: "", 
    content: "" 
  });
  const [emailDialogOpen, setEmailDialogOpen] = useState(false); // State for popup
  const [loading, setLoading] = useState(false); // State for loading indicator

  useEffect(() => {
    LoginHandler.setInfoOrToken(setInfoDialogData, setToken);
  }, []);

  const fetchAdmins = () => {
    setLoading(true); // Show progress bar
    fetch(Endpoints.ADMIN, {
      headers: {
        Authorization: `${token}`,
      },
    })
    .then((response) => response.json())
    .then((response) => response.length > 0 ? setAdminEmails(response) : response)
    .catch((error) => {
      console.error('Error:', error);
      setInfoDialogData({ 
        open: true, 
        title: "Error", 
        content: "Failed to fetch admin list" 
      });
    })
    .finally(() => {
      setLoading(false); // Hide progress bar
    });
  };

  useEffect(() => {
    if (token) {
      fetchAdmins();
    }
  }, [token]);

  const handleAddAdmin = () => {
    if (!newEmails.trim()) {
      setInfoDialogData({
        open: true,
        title: "Error",
        content: "Please enter at least one email address"
      });
      return;
    }

    const emailList = newEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emailList.length === 0) {
      setInfoDialogData({
        open: true,
        title: "Error",
        content: "Please enter valid email addresses"
      });
      return;
    }

    fetch(Endpoints.ADMIN, {
      method: 'POST',
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emails: emailList })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to add admins');
      }
      return response.json();
    })
    .then((data) => {
      setInfoDialogData({
        open: true,
        title: "Success",
        content: data.message || "Admins added successfully"
      });
      setNewEmails(""); // Clear input
      fetchAdmins(); // Refresh the list
    })
    .catch(error => {
      console.error('Error:', error);
      setInfoDialogData({
        open: true,
        title: "Error",
        content: "Failed to add admins"
      });
    });
  };

  const handleRemoveAdmin = (email) => {
    setLoading(true); // Show progress bar during deletion
    fetch(Endpoints.ADMIN, {
      method: 'DELETE',
      headers: {
        'Authorization': `${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to remove admin');
      }
      return response.json();
    })
    .then((data) => {
      setInfoDialogData({
        open: true,
        title: "Success",
        content: data.message || "Admin removed successfully"
      });
      fetchAdmins(); // Refresh the list
    })
    .catch(error => {
      console.error('Error:', error);
      setInfoDialogData({
        open: true,
        title: "Error",
        content: "Failed to remove admin"
      });
    })
    .finally(() => {
      setLoading(false); // Hide progress bar
    });
  };

  return (
    <Paper sx={{ maxWidth: 600, margin: '20px auto', padding: 2 }}>
      <InfoDialog 
        {...infoDialogData} 
        handleClose={() => setInfoDialogData({ open: false, title: "", content: "" })} 
      />
      
      <Typography variant="h6" gutterBottom>
        Admin List
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />} {/* Show progress bar when loading */}

      <Button 
        variant="contained" 
        onClick={() => setEmailDialogOpen(true)}
        sx={{ mb: 2 }}
      >
        Manage Admins
      </Button>

      <List>
        {adminEmails.map((email, index) => (
          <ListItem 
            key={index} 
            divider={index !== adminEmails.length - 1}
            secondaryAction={
              <IconButton 
                edge="end" 
                aria-label="delete" 
                onClick={() => handleRemoveAdmin(email)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={email} />
          </ListItem>
        ))}
      </List>

      {/* Dialog for Adding Admins */}
      <Dialog 
        open={emailDialogOpen} 
        onClose={() => setEmailDialogOpen(false)} 
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Manage Admins</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            label="New Admin Emails (comma-separated)"
            placeholder="email1@example.com, email2@example.com"
            value={newEmails}
            onChange={(e) => setNewEmails(e.target.value)}
            helperText="Enter multiple emails separated by commas"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              handleAddAdmin();
              setEmailDialogOpen(false);
            }}
          >
            Add Admins
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Admin;

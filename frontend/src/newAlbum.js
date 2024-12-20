import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Stack,
  Box 
} from '@mui/material';
import Endpoints from './Endpoints';

const NewAlbum = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        fetch(Endpoints.NEW_ALBUM,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                description: description
            })
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.error(error);
        });

    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom
                    sx={{ mb: 4 }}
                >
                    Create New Album
                </Typography>
                <Stack spacing={3}>
                    <TextField
                        label="Title"
                        variant="outlined"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        label="Description"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Box sx={{ mt: 2 }}>
                        <Button 
                            onClick={handleSubmit}
                            variant="contained" 
                            color="primary"
                            size="large"
                        >
                            Create Album
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Container>
    );
};

export default NewAlbum;
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Container } from '@mui/material';
import Endpoints from './Endpoints';

const Albums = () => {
    const [albums, setAlbums] = useState([]);
    useEffect(() => {
        fetch(Endpoints.ALBUMS)
        .then((response) => response.json())
        .then((data) => setAlbums(data));

    },[]);

    const openAlbum = (id) => window.open("/album/"+id, "_blank") 
    return (
        <Container p={3}>
        <Grid container spacing={2}>
            {albums.map((album) => (
                <Grid item xs={12} sm={6} md={4} key={album._id}> 
                    <Card onClick={() => openAlbum(album.album_id)} >
                        <CardContent >
                            <Typography variant="h5" component="div">
                                {album.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {album.description}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
        </Container>

    );
};

export default Albums;
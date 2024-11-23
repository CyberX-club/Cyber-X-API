import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Container, CircularProgress, Box } from '@mui/material';
import Endpoints from './Endpoints';
import LoginHandler from './LoginHandler';
import { handleContextMenu,defaultContextMenuProps,dfeaultOnClose } from './CustomContextMenu';
import ContextMenu from './CustomContextMenu';
import InfoDialog from './Dialog';
import Loading from './components/Loading';
import { defaultInfoDialogProps } from './Dialog';

const Albums = () => {
    const [albums, setAlbums] = useState([]);
    const [contextMenu, setContextMenu] = useState(defaultContextMenuProps);
    const [contextMenuData, setContextMenuData] = useState(null);
    const [infoDialog, setInfoDialog] = useState(defaultInfoDialogProps);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);


    const unsetLoading = () => setLoading(false);

    useEffect(() => {
        LoginHandler.setInfoOrToken(setInfoDialog, setToken);
      }, []);

    const localHandleContextMenu = () => {};
    const handleAlbumDelete = (id) => {
        try{
            fetch(Endpoints.DEL_ALBUM(id), {
                method: 'DELETE',
                headers: Endpoints.BUILD_HEADERS(token)
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setAlbums(albums.filter((album) => album.album_id !== id));
                }
            });
        }
        catch(e){
            console.error(e);
        }
    };

    useEffect(() => {
        try{
            fetch(Endpoints.ALBUMS,{
                headers: Endpoints.BUILD_HEADERS(token)
            })
            .then((response) => response.json())
            .then((data) => data.length && setAlbums(data))
            .finally(unsetLoading);
    
        }
        catch(e){
            console.error(e);
        }
        
    },[token]);

    const openAlbum = (id) => window.open("/album/"+id, "_blank") 
    return (
        <Container p={3}>
            {loading && (
                 <Loading loading={loading} message="Loading Albums..." />
            )}
        <InfoDialog {...infoDialog} />
        <ContextMenu {...contextMenu} onClose={() => dfeaultOnClose(setContextMenu)} data={contextMenuData} />
        <Grid container spacing={2}>
            {albums.map((album) => (
                <Grid item xs={12} sm={6} md={4} key={album._id} > 
                    <Card 
                    onClick={() => openAlbum(album.album_id)}
                    onContextMenu={(e) => handleContextMenu(e,setContextMenu,setContextMenuData,[
                        {
                            title: "Open",
                            onClick: () => openAlbum(album.album_id)
                        },
                        {
                            title: "Delete",
                            onClick: () => handleAlbumDelete(album.album_id)
                        }
                    ],localHandleContextMenu)}
                    >
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
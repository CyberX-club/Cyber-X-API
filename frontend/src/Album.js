import { 
  Grid, Card, CardMedia, CardContent, Typography, Box, Paper,
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, IconButton, List, ListItem,
  ListItemText, ListItemSecondaryAction, styled
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Endpoints from './Endpoints';
import ContextMenu from './CustomContextMenu';
import LoginHandler from './LoginHandler';
import InfoDialog from './Dialog';

const DropZone = styled(Paper)(({ theme, isDragActive }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: isDragActive ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
}));

const UploadDialog = ({ open, onClose, onUpload, isUploading }) => {
  const [uploadQueue, setUploadQueue] = useState([]);
  
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      title: '',
      description: '',
      preview: URL.createObjectURL(file)
    }));
    setUploadQueue(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxFiles: 10
  });

  const handleRemoveFile = (index) => {
    setUploadQueue(prev => {
      const newQueue = [...prev];
      URL.revokeObjectURL(newQueue[index].preview);
      newQueue.splice(index, 1);
      return newQueue;
    });
  };

  const handleUpdateMetadata = (index, field, value) => {
    setUploadQueue(prev => {
      const newQueue = [...prev];
      newQueue[index] = { ...newQueue[index], [field]: value };
      return newQueue;
    });
  };

  const handleUpload = async () => {
    const formData = new FormData();
    uploadQueue.forEach((item, index) => {
      formData.append('files', item.file);
      formData.append(`title_${index}`, item.title || null);
      formData.append(`description_${index}`, item.description || null);
    });
    
    await onUpload(formData);
    setUploadQueue([]);
    onClose();
  };

  // Cleanup previews when dialog closes
  useEffect(() => {
    if (!open) {
      uploadQueue.forEach(item => URL.revokeObjectURL(item.preview));
      setUploadQueue([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Upload Images
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DropZone {...getRootProps()} isDragActive={isDragActive}>
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
          <Typography variant="h6">
            {isDragActive ? "Drop images here" : "Drag & drop images, or click to select"}
          </Typography>
        </DropZone>

        <List sx={{ mt: 2 }}>
          {uploadQueue.map((item, index) => (
            <ListItem 
              key={index}
              sx={{ 
                border: 1, 
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                p: 2 
              }}
            >
              <Box display="flex" gap={2} width="100%">
                <img 
                  src={item.preview}
                  alt="Preview"
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 4
                  }}
                />
                <Box flex={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Title"
                    value={item.title}
                    onChange={(e) => handleUpdateMetadata(index, 'title', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Description"
                    value={item.description}
                    onChange={(e) => handleUpdateMetadata(index, 'description', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Box>
                <IconButton 
                  onClick={() => handleRemoveFile(index)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleUpload}
          variant="contained"
          disabled={uploadQueue.length === 0 || isUploading}
        >
          {isUploading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Uploading...
            </>
          ) : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Album = ({ album_id_safe }) => {
  const [albumData, setAlbumData] = useState([]);
  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0 });
  const [contextMenuData, setContextMenuData] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [token, setToken] = useState('');
  const [infoDialog, setInfoDialog] = useState({ open: false, title: '', content: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { album_id } = useParams();

  const handleUpload = async (formData) => {
    setIsUploading(true);
    try {
      const response = await fetch(Endpoints.UPLOAD_IMAGE(album_id || album_id_safe), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed with status: ' + response.status);
      }

      fetchAlbumData();
    } catch (error) {
      console.error('Upload failed:', error);
      setInfoDialog({
        open: true,
        title: 'Upload Failed',
        content: 'Failed to upload images. Please try again.',
        handleClose: () => setInfoDialog({ ...infoDialog, open: false })
      });
    } finally {
      setIsUploading(false);
    }
  };

  const fetchAlbumData = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(Endpoints.IMAGES_IN_ALBUM(album_id || album_id_safe), {
        headers: { 'Authorization': token }
      });
      const data = await response.json();
      setAlbumData(data);
    } catch (error) {
      console.error('Failed to fetch album:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, album_id, album_id_safe]);

  useEffect(() => {
    LoginHandler.setInfoOrToken(setInfoDialog, setToken);
  }, []);

  useEffect(() => {
    fetchAlbumData();
  }, [fetchAlbumData]);

  const handleContextMenu = (event, image) => {
    event.preventDefault();
    setCurrentImage(image);
    setContextMenu({ 
      open: true, 
      x: event.clientX, 
      y: event.clientY 
    });
    setContextMenuData([
      {
        title: 'Open in new tab',
        onClick: () => window.open(image.link, '_blank')
      },
      {
        title: 'Copy link',
        onClick: () => navigator.clipboard.writeText(image.link)
      },
      {
        title: 'Delete',
        onClick: async () => {
          try {
            await fetch(Endpoints.DEL_IMAGE(image.id), {
              method: 'DELETE',
              headers: { 'Authorization': token }
            });
            fetchAlbumData();
          } catch (error) {
            console.error('Delete failed:', error);
          }
        }
      }
    ]);
  };

  return (
    <Box p={4}>
      <InfoDialog {...infoDialog} onClose={() => setInfoDialog({ ...infoDialog, open: false })} />
      <ContextMenu
        {...contextMenu}
        onClose={() => setContextMenu({ open: false, x: 0, y: 0 })}
        data={contextMenuData}
      />

      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUpload}
        isUploading={isUploading}
      />

      <DropZone 
        onClick={() => setUploadDialogOpen(true)}
        sx={{ mb: 3 }}
      >
        <CloudUploadIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
        <Typography variant="h6">
          Click to upload images
        </Typography>
      </DropZone>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {albumData.length > 0 ? (
            albumData.map((image) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                <Card 
                  onContextMenu={(e) => handleContextMenu(e, image)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[8]
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={image.link}
                    alt={image.title}
                    sx={{ objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => window.open(image.link, '_blank')}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {image.title || "Untitled"}
                    </Typography>
                    {image.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {image.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                No images found. Click the upload area to add some images!
              </Alert>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default Album;
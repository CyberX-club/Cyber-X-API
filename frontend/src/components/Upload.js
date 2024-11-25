import { 
    Typography, Box, Paper,CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogActions, Button, TextField, IconButton, List, ListItem,styled
  } from '@mui/material';
  import { useState, useEffect, useCallback } from 'react';
  import { useParams } from 'react-router-dom';
  import { useDropzone } from 'react-dropzone';
  import CloudUploadIcon from '@mui/icons-material/CloudUpload';
  import DeleteIcon from '@mui/icons-material/Delete';
  import CloseIcon from '@mui/icons-material/Close';

  

const DropZone = styled(Paper)(({ theme, isDragActive }) => ({
    padding: theme.spacing(2),
    textAlign: 'center',
    border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
    backgroundColor: isDragActive ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  }));


  const UploadEditBox = ({
    item={
        preview: '',
        title: '',
        description: '',
    },
    index,
    handleUpdateMetadata,
    handleRemoveFile,
    icon=<DeleteIcon />,
    size=100

  }) => {
    return (
        <Box display="flex" gap={2} width="100%">
        <img 
          src={item.preview}
          alt="Preview"
          style={{
            width: size,
            height: size,
            objectFit: 'cover',
            borderRadius: 4
          }}
        />
        <Box flex={1}>
          <TextField
            fullWidth
            size="small"
            label="Title"
            value={item.title}errors
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
          {icon || <DeleteIcon />}
        </IconButton>
      </Box>
    );
  };

  
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
                <UploadEditBox item={item} index={index} handleUpdateMetadata={handleUpdateMetadata} handleRemoveFile={handleRemoveFile} />
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


export { DropZone, UploadDialog,UploadEditBox };
  
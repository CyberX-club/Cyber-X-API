import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useState, useEffect, useCallback, memo } from "react";
import { useParams } from "react-router-dom";
import Endpoints from "./Endpoints";
import ContextMenu from "./CustomContextMenu";
import LoginHandler from "./LoginHandler";
import InfoDialog from "./Dialog";
import { defaultInfoDialogProps } from "./Dialog";
import { handleContextMenu } from "./CustomContextMenu";
import { UploadDialog, DropZone, UploadEditBox } from "./components/Upload";
import { Save } from "@mui/icons-material";

// Memoized EditBox component to prevent unnecessary re-renders
const EditBox = memo(({ open, onClose, item, onSave }) => {
  // Local state to manage form values with default empty values
  const [editedItem, setEditedItem] = useState({
    preview: "",
    title: "",
    description: "",
    ...item, // Spread item properties if it exists
  });

  // Update local state when item prop changes
  useEffect(() => {
    if (item) {
      setEditedItem({
        preview: "",
        title: "",
        description: "",
        ...item,
      });
    }
  }, [item]);

  // Handle field updates
  const handleUpdateMetadata = (index, field, value) => {
    setEditedItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle dialog close
  const handleClose = () => {
    // if (editedItem) {
    //   onSave(editedItem);
    // }
    onClose();
  };

  // Don't render the dialog if there's no item
  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">Edit Image Details</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <UploadEditBox
          item={editedItem}
          index={0}
          handleUpdateMetadata={handleUpdateMetadata}
          handleRemoveFile={() => {
            onSave(editedItem);
          }}
          icon={<Save />}
          size={200}
        />
      </DialogContent>
    </Dialog>
  );
});

const Album = ({ album_id_safe }) => {
  const [albumData, setAlbumData] = useState([]);

  const [contextMenu, setContextMenu] = useState({ open: false, x: 0, y: 0 });
  const [contextMenuData, setContextMenuData] = useState([]);

  const [currentImage, setCurrentImage] = useState(null);
  const [token, setToken] = useState("");
  const [infoDialog, setInfoDialog] = useState(defaultInfoDialogProps);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { album_id } = useParams();

  const handleUpload = async (formData) => {
    setIsUploading(true);
    try {
      const response = await fetch(
        Endpoints.UPLOAD_IMAGE(album_id || album_id_safe),
        {
          method: "POST",
          headers: Endpoints.BUILD_HEADERS(token),
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed with status: " + response.status);
      }

      fetchAlbumData();
    } catch (error) {
      console.error("Upload failed:", error);
      setInfoDialog({
        open: true,
        title: "Upload Failed",
        content: "Failed to upload images. Please try again.",
        handleClose: () => setInfoDialog({ ...infoDialog, open: false }),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const fetchAlbumData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        Endpoints.IMAGES_IN_ALBUM(album_id || album_id_safe),
        {
          headers: { Authorization: token },
        }
      );
      const data = await response.json();
      setAlbumData(data);
    } catch (error) {
      console.error("Failed to fetch album:", error);
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

  const localHandleContextMenu = (event, image) => {
    handleContextMenu(
      event,
      setContextMenu,
      setContextMenuData,
      [
        {
          title: "Open in new tab",
          onClick: () => window.open(image.link, "_blank"),
        },
        {
          title: "Copy link",
          onClick: () => navigator.clipboard.writeText(image.link),
        },
        {
          title: "Delete",
          onClick: async () => {
            try {
              await fetch(Endpoints.DEL_IMAGE(image.id), {
                method: "DELETE",
                headers: { Authorization: token },
              });
              fetchAlbumData();
            } catch (error) {
              console.error("Delete failed:", error);
            }
          },
        },
      ],
      () => setCurrentImage(image)
    );
  };

  const handleSaveEdit = async (editedItem) => {
    try {
      // Here you would typically make an API call to save the changes
      // For now, we'll just update the local state
      


      fetch(Endpoints.EDIT_IMAGE(editedItem.id), {
        method: "POST",
        headers: {
          ...Endpoints.BUILD_HEADERS(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editedItem.title,
          description: editedItem.description,
      })})
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        });



      var newItems = albumData.map((item) =>
        item.link === editedItem.preview
          ? {
              ...item,
              title: editedItem.title,
              description: editedItem.description,
            }
          : item
      );

      

      setAlbumData((prev) => newItems);
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
  };

  const handleClickOpen = (item) => {
    if (item) {
      setSelectedItem(item);
      setEditDialogOpen(true);
    }
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedItem(null);
  };

  return (
    <Box p={4}>
      <EditBox
        open={editDialogOpen}
        onClose={handleEditClose}
        item={selectedItem}
        onSave={handleSaveEdit}
      />
      <InfoDialog
        {...infoDialog}
        onClose={() => setInfoDialog({ ...infoDialog, open: false })}
      />
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

      <DropZone onClick={() => setUploadDialogOpen(true)} sx={{ mb: 3 }}>
        {/* <CloudUploadIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} /> */}
        <Typography variant="h6">Click to upload images</Typography>
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
                  onContextMenu={(e) => localHandleContextMenu(e, image)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: (theme) => theme.shadows[8],
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={image.link}
                    alt={image.title}
                    sx={{ objectFit: "cover", cursor: "pointer" }}
                    onClick={() => {
                      handleClickOpen({
                        id: image.id,
                        preview: image.link,
                        title: image.title,
                        description: image.description,
                      });
                    }}
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
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
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

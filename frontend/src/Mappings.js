import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // Icon for accordion
import Endpoints from "./Endpoints";
import InfoDialog from "./Dialog";
import { Auth } from "./Endpoints";
import ContextMenu from "./CustomContextMenu";
import { defaultContextMenuProps, dfeaultOnClose, handleContextMenu } from "./CustomContextMenu";


const Mappings = () => {
  const [mappings, setMappings] = useState([]);
  const { token, infoDialog } = Auth();
  const [reRun, setReRun] = useState(false);
  const [contextMenu, setContextMenu] = useState(defaultContextMenuProps);
  const [selectedData, setSelectedData] = useState({});

  const [contextMenuData, setContextMenuData] = useState([]);


  useEffect(() => {
    if (token) {
      fetch(Endpoints.MAPPINGS, {
        headers: Endpoints.BUILD_HEADERS(token),
      })
        .then((response) => response.json())
        .then((data) => {
          setMappings(data);
        });
    } else {
      console.error("No token available.");
    }
  }, [token,reRun]);

  const handleDeleteMapping = (id) => {
    try {
      fetch(Endpoints.DEL_MAPPING(id), {
        method: "DELETE",
        headers: Endpoints.BUILD_HEADERS(token),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setMappings(mappings.filter((mapping) => mapping._id !== id));
          }
        })
        .finally(() => setReRun(!reRun));

    } catch (e) {
      console.error(e);
    }
  };



  return (
    <Box p={4}>
      <InfoDialog {...infoDialog} />
      <ContextMenu {...contextMenu} data={contextMenuData} onClose={() => dfeaultOnClose(setContextMenu)} />
      <Typography variant="h4">Mappings</Typography>
      
      {mappings.map((mapping) => (
        <Accordion key={mapping.id} onContextMenu={(e) => handleContextMenu(e, setContextMenu, setContextMenuData, [
          { title: "Edit", onClick: () => { window.location.href = `/mappings/${mapping._id}`; } },
          { title: "Delete", onClick: () => { handleDeleteMapping(mapping._id) } }
        ], () => {
          setSelectedData(mapping);
          console.log("Selected data: ", selectedData);
        } )}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="h6">
                  {mapping.name}:{mapping._id}
                </Typography>
              </Grid>
              <Grid>
                <Button
                  href={`/mappings/${mapping._id}`}
                  variant="outlined"
                  fullWidth
                >
                  Edit
                </Button>
              </Grid>
            </Grid>
          </AccordionSummary>

          <AccordionDetails>
            {/* Render a table for each mapping */}
            {mapping.mappings ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Spreadsheet Title</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Python Title</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mapping.mappings.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.sheets_header}</TableCell>
                      <TableCell>{row.python_header}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2">No mappings available.</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Mappings;

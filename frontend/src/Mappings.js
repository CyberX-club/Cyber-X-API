import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Button } from "@mui/material";
import { useEffect, useState } from "react";
import Grid from '@mui/material/Grid2';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';  // Icon for accordion
import Endpoints from "./Endpoints";

const Mappings = () => {
    const [mappings, setMappings] = useState([]);

    useEffect(() => {
        fetch(Endpoints.MAPPINGS)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setMappings(data);
            });
    }, []);

    return (
        <Box p={4}>
            <Typography variant="h4">Mappings</Typography>
            {mappings.map((mapping) => (
                <Accordion key={mapping.id}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Grid container spacing={2}>
                            <Grid size={12}>
                                <Typography variant="h6">{mapping.name}:{mapping._id}</Typography>
                            </Grid>
                            <Grid>
                                <Button href={`/mappings/${mapping._id}`} variant="outlined"  fullWidth>Edit</Button>    
                            </Grid>
                        </Grid>
                        
                    </AccordionSummary>
                    
                    <AccordionDetails>
                        {/* Render a table for each mapping */}
                        {mapping.mappings ? (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Spreadsheet Title</strong></TableCell>
                                        <TableCell><strong>Python Title</strong></TableCell>
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

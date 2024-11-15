import { Box, Button, Divider, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DataGrid } from '@mui/x-data-grid';
import { useParams } from 'react-router-dom';
import Endpoints  from './Endpoints';
import { useEffect, useState } from 'react';

const randomId = () => {
    return Math.floor(Math.random() * 100000);
};


const Mapping = () => {

    const { slug } = useParams();
    //alert(slug);



    const columns = [
        { field: 'sheets_header', headerName: 'Sheets Title', flex: 1, minWidth: 100, editable: true },
        { field: 'python_header', headerName: 'Python Code Title', flex: 1, minWidth: 100, editable: true },
    ]

    const [name, setName] = useState("");
    const [id, setId] = useState(slug);
    const [newRow, setNewRow] = useState({ sheets_header: '', python_header: '' });
    const changeHandler = (e, type) => {

        switch (type) {
            case 'sheets_header':
                setNewRow({ ...newRow, sheets_header: e.target.value });
                break;

            case 'python_header':
                setNewRow({ ...newRow, python_header: e.target.value });
                break;

            case 'add':
                console.log(newRow);
                setRows([...rows, { id: randomId(), ...newRow }]);
                setNewRow({ sheets_header: '', python_header: '' });
                break;
                
            case 'submit':
                const data = {
                    name: name,
                    id: id,
                    mappings: rows
                };
                fetch(Endpoints.CREATE_SPREADSHEET(id), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                });
                
                break;
            default:
                break
        };
    };
    const [rows, setRows] = useState([]);

    



    return (
        <Box style={{ height: 400, width: '100%' }} p={2} >
            <Typography variant="h4" gutterBottom>
                Mapping Name
            </Typography>
            <TextField
                id="outlined-basic"
                label="Mapping Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <Divider />
            <Typography variant="h4" gutterBottom>
                Spreadsheet Id
            </Typography>
            <TextField
                id="outlined-basic"
                label="Spreadsheet Id"
                variant="outlined"
                fullWidth
                value={id}
                onChange={(e) => setId(e.target.value)}
            />

            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                // onRowSelectionModelChange={(data) => console.dir(data)}
                checkboxSelection
            />

            <Grid container spacing={2} p={2}>
                <Grid spacing={2} item size={6}>
                    <TextField id="outlined-basic" label="Sheets Title" variant="outlined" fullWidth value={newRow.sheets_header} onChange={(e) => changeHandler(e, 'sheets_header')} />
                </Grid>

                <Grid spacing={2} item size={6}>
                    <TextField id="outlined-basic" label="Python Data Title" variant="outlined" fullWidth value={newRow.python_header} onChange={(e) => changeHandler(e, 'python_header')} />
                </Grid>


                <Grid spacing={2} item size={12} >
                    <Button fullWidth variant='secondary' onClick={(e) => changeHandler(e, 'add')}> Add A New Mapping!</Button>
                </Grid>
            </Grid>

            <Grid spacing={2} item size={12}>
                <Button variant='contained' color='primary' fullWidth py={4} onClick={(e) => changeHandler(e,'submit')}> Save Mapping </Button>
            </Grid>
        </Box>



    )
};

export default Mapping;
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DataGrid, GridDeleteIcon } from "@mui/x-data-grid";
import { useParams } from "react-router-dom";
import Endpoints from "./Endpoints";
import { useEffect, useState } from "react";
import LoginHandler from "./LoginHandler";
import InfoDialog from "./Dialog";

const Mapping = () => {
  const { slug } = useParams();

  const columns = [
    {
      field: "sheets_header",
      headerName: "Sheets Title",
      flex: 1,
      minWidth: 100,
      editable: true,
    },
    {
      field: "python_header",
      headerName: "Python Code Title",
      flex: 1,
      minWidth: 100,
      editable: true,
    },
  ];

  const [name, setName] = useState("");
  const [id, setId] = useState(slug);
  const [newRow, setNewRow] = useState({
    sheets_header: "",
    python_header: "",
  });
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [token, setToken] = useState("");
  const [infoDialogData, setInfoDialogData] = useState({
    open: false,
    title: "",
    content: "",
  });

  useEffect(() => {
    LoginHandler.setInfoOrToken(setInfoDialogData, setToken);
  }, []);

  const changeHandler = (e, type) => {
    switch (type) {
      case "sheets_header":
        setNewRow({ ...newRow, sheets_header: e.target.value });
        break;
      case "python_header":
        setNewRow({ ...newRow, python_header: e.target.value });
        break;
      case "add":
        setRows([...rows, { id: randomId(), ...newRow }]);
        setNewRow({ sheets_header: "", python_header: "" });
        break;

      case "submit":
        const data = { name: name, id: slug, mappings: rows };

        fetch(Endpoints.CREATE_SPREADSHEET(slug), {
          method: "POST",
          headers: {
            ...Endpoints.BUILD_HEADERS(token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
          });
        break;
      default:
        break;
    }
  };

  const handleCellEditCommit = (params) => {
    const updatedRows = [...rows];
    updatedRows[params.id] = {
      ...updatedRows[params.id],
      [params.field]: params.value,
    };
    setRows(updatedRows);
  };

  const randomId = () => {
    return Math.floor(Math.random() * 100000);
  };

  useEffect(() => {
    fetch(Endpoints.MAPPING(slug), {
      headers: {
        Authorization: `${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setName(data.name);
        setId(data.id);
        if (data.mappings) {
          setRows(data.mappings);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [slug, token]);

  return (
    <Box style={{ height: 400, width: "100%" }} p={2}>
      <InfoDialog {...infoDialogData} />
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
        checkboxSelection
        // onCellEditStop={(params, event) => {
        //     console.dir(params);
        //     // if (params.reason === GridCellEditStopReasons.cellFocusOut) {
        //     //   event.defaultMuiPrevented = true;
        //     // }
        //   }}
        onRowSelectionModelChange={(newSelection) => {
          setSelectedRows(newSelection);
        }}
        processRowUpdate={(updatedRow, originalRow) => {
          // update rows (array) (on the basis of id) with updatedRow

          let newRows = [...rows];
          newRows.map((row, index) => {
            if (row.id === updatedRow.id) {
              newRows[index] = updatedRow;
            }
          });
          setRows(newRows);
        }}
        onCellEditCommit={handleCellEditCommit}
      />
      <Paper m={2}>
        <Grid container spacing={2} p={2}>
          <IconButton
            disabled={selectedRows.length <= 0}
            onClick={() => {
              let newRows = [...rows];
              selectedRows.map((row) => {
                newRows = newRows.filter((r) => r.id !== row);
              });
              setRows(newRows);
            }}
          >
            <GridDeleteIcon />
          </IconButton>
        </Grid>
      </Paper>
      <Grid container spacing={2} p={2}>
        <Grid spacing={2} item size={6}>
          <TextField
            id="outlined-basic"
            label="Sheets Title"
            variant="outlined"
            fullWidth
            value={newRow.sheets_header}
            onChange={(e) => changeHandler(e, "sheets_header")}
          />
        </Grid>

        <Grid spacing={2} item size={6}>
          <TextField
            id="outlined-basic"
            label="Python Data Title"
            variant="outlined"
            fullWidth
            value={newRow.python_header}
            onChange={(e) => changeHandler(e, "python_header")}
          />
        </Grid>

        <Grid spacing={2} item size={12}>
          <Button
            fullWidth
            variant="secondary"
            onClick={(e) => changeHandler(e, "add")}
          >
            {" "}
            Add A New Mapping!
          </Button>
        </Grid>
      </Grid>

      <Grid spacing={2} item size={12}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          py={4}
          onClick={(e) => changeHandler(e, "submit")}
        >
          {" "}
          Save Mapping{" "}
        </Button>
      </Grid>
    </Box>
  );
};

export default Mapping;

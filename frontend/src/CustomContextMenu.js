import { Menu, MenuItem } from "@mui/material";

const ContextMenu = ({ open, x, y, onClose, data }) => {
    return (
        <Menu
            open={open}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={{ top: y, left: x }}
        >
            {
                data && data.map((item,id) => (
                    <MenuItem key={id} onClick={(e) => {item.onClick(e); onClose(e);}}>
                        {item.title}
                    </MenuItem>
                ))
            }
        </Menu>
    );
};

export default ContextMenu;
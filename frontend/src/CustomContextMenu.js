import { Menu, MenuItem } from "@mui/material";


const handleContextMenu = (event,setContextMenu,setContextMenuData,data,additionalFunction) => {
    event.preventDefault();

    if (additionalFunction) {
        additionalFunction(event);
    }
    
    setContextMenu({ 
      open: true, 
      x: event.clientX, 
      y: event.clientY 
    });
    setContextMenuData(data);
  };

const defaultProps = { open: false, x: 0, y: 0 };
const dfeaultOnClose = (setContextMenu) => {setContextMenu(defaultProps);};

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
export { handleContextMenu,defaultProps as defaultContextMenuProps,dfeaultOnClose };
export default ContextMenu;
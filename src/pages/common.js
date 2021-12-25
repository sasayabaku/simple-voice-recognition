import React, {useState} from "react";
import { styled, useTheme } from '@mui/material/styles';

import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';

import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { createTheme, ThemeProvider } from '@mui/material/styles';

const drawerWidth = 240;

const page = "authentication"

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: `-${drawerWidth}px`,
      ...(open && {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      }),
    }),
);

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
  })(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    backgroundColor: '#FBFBFB',
    color: "#A5ADBE"
    }));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
}));

const theme = createTheme({
    typography: {
        fontFamily: ['Noto Sans JP', 'Helvetica'].join(',')
    }
});

const linkData = [
    {label: 'Authentication'},
    {label: 'Database'}
]

const SideMenu = ({open}) => {
    return(
        <>
            <DrawerHeader>
                Speech
            </DrawerHeader>
            <Divider />
            <Box>
                <ListItemText
                    primary="Dashboard"
                    primaryTypographyProps={{
                        fontSize: 15,
                        fontWeight: 'medium',
                        lineHeight: '20px',
                        mb: '2px',
                        paddingLeft: '1rem',
                        marginTop: '1rem'
                    }}

                />

                {open && linkData.map((item) => (
                    <ListItemButton
                        key={item.label}
                        sx={{
                            py: 0,
                            minHeight: 32,
                            color: 'rgba(85, 85, 85, .9)',
                            margin: '.5rem 1rem',
                        }}
                    >
                        <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                                fontSize: 14,
                                fontWeight: 'medium',
                                padding: '.5rem 0'
                            }}
                        />
                    </ListItemButton>
                ))}

            </Box>
        </>
    )
}

const Contents = ({ children }) => {

    const [open, setOpen] = useState(false);
    const handleDrawer = () => {
        if (open) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    };

    return(
        <ThemeProvider theme={theme}>
            <Box sx={{ 
                display: 'flex', 
                backgroundColor: '#F9F9F9'
            }}>
                <AppBar position="fixed" open={open}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={handleDrawer}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box'
                    },
                    }}
                    variant="persistent"
                    anchor="left"
                    open={open} 
                ><SideMenu open={open} /></Drawer>
                
                <Main open={open}>
                    <DrawerHeader />
                    {children}
                </Main>
                
            </Box>
        </ThemeProvider>
    )
}

export default Contents;
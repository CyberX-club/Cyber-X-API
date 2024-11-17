import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LoginHandler from './LoginHandler';

const Login = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    LoginHandler.onAuthChange((user,token) => {
        if(user)
            {
                window.location.href = "/";
            }
    });
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                minHeight: '100vh',
            }}
        >
            <Container maxWidth="sm">
                <Typography variant="h2" gutterBottom sx={{ textAlign: 'center' }}>
                    Welcome Admin!
                    <Box sx={{ fontFamily: 'Rubik Mono One' }}>Original Work by: Tshonq</Box>
                </Typography>
                <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
                    Sign in to Unlock Endless Possiblities
                </Typography>
            </Container>
            <Container maxWidth="sm">
                <Grid container spacing={2}>
                    <Divider/>
                    {
                    Object.values(LoginHandler.providers).map((provider) => {
                        return(
                            <Grid item xs={12}>
                                <Button variant={"contained"} fullWidth startIcon={provider.icon()} onClick={() => LoginHandler.loginProvider(provider.provider)}>
                                    {provider.label}
                                </Button>
                            </Grid>
                        )
                    })
                    }
                </Grid>
            </Container>
        </Box>
    );
};

export default Login;


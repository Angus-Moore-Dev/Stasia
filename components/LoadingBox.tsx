import { Box, CircularProgress, ThemeProvider, Typography, createTheme } from "@mui/material";

interface LoadingBoxProps
{
    content?: JSX.Element;
}

const theme = createTheme({
    palette: {
        primary: {
            main: '#00ff48'
        }
    }
})

export default function LoadingBox({ content }: LoadingBoxProps)
{
    return (
        <Box position="relative" display="inline-flex">
        <ThemeProvider theme={theme}>
            <CircularProgress size={content ? 96 : 32} color="primary" disableShrink sx={{
                animationDuration: '550ms',
            }} />
        </ThemeProvider>
        <Box
            top={0}
            left={0}
            bottom={0}
            right={0}
            position="absolute"
            display="flex"
            alignItems="center"
            justifyContent="center"
            padding={4}
        >
            <Typography variant="caption" component="div" color="textSecondary">
                {content}
            </Typography>
        </Box>
        </Box>
    );
}
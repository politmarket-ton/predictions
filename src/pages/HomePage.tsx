// HomePage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ImageUrls } from '../ImageUrls';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const startParam = getStartParam(window.Telegram.WebApp.initData);
            if (startParam != null && startParam !== "") {
                const timer = setTimeout(() => {
                    navigate('/bet/'.concat(startParam))
                }, 1000);
                return () => clearTimeout(timer);
            } else {
                const timer = setTimeout(() => {
                    navigate('/list')
                }, 1000);
                return () => clearTimeout(timer);
            }
        } catch (error) {
            console.log("getting init data error: ", error)
            const timer = setTimeout(() => {
                navigate('/list')
            }, 1000);
            return () => clearTimeout(timer);
        }
    });

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh', // Full height of the viewport
                textAlign: 'center'
            }}
        >
            <Box
                component="img"
                src={ImageUrls.tonLogoUrl}
                alt="Your Image"
                sx={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'cover',
                    filter: 'invert(1)', // This makes the image white
                }}
            />
            <CircularProgress sx={{ color: '#2c9cdb', mt: 3 }} />
        </Box >
    );
}

function getStartParam(queryString: string): string | null {
    const decodedString = decodeURIComponent(queryString);
    const params = new URLSearchParams(decodedString);
    return params.get('start_param');
}

export default HomePage;
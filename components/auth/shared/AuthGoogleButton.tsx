import React from "react";
import { Box, Button, ButtonProps } from "@mui/material";

export default function AuthGoogleButton({ children, ...props }: ButtonProps) {
    return (
        <Button
            variant="contained"
            fullWidth
            {...props}
            startIcon={
                <Box component="img" src="/google-icon.svg" sx={{ width: 18, scale: 2 }} />
            }
            sx={{
                borderRadius: 3,
                py: 1.3,
                backgroundColor: '#F3F0FA',
                color: '#7E6BB5',
                textTransform: 'none',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                '&:hover': {
                    backgroundColor: '#E8E2F6',
                },
                ...props.sx,
            }}
        >
            {children}
        </Button>
    );
}

import { Container, Typography, Box } from "@mui/material";
import React from "react";
import "@/css/pages.css";

const History = () => {
    return (
        <Container maxWidth="xl" className="page-container">
            <Box className="page-header">
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    History
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    View your generation history.
                </Typography>
            </Box>
        </Container>
    );
};

export default History;

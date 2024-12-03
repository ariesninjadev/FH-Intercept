const express = require('express');
const app = express();

// Middleware to parse JSON payloads
app.use(express.json());

// Define an endpoint to handle the webhook requests
app.post('/webhook', (req, res) => {
    console.log('Received a webhook request:');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    // Respond to the webhook sender
    res.status(200).send('Webhook received!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

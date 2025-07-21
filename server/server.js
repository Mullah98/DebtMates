import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());
const serviceAccount = JSON.parse(fs.readFileSync('./server/firebase-admin-key.json', 'utf-8'));

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

app.post('/send-notification', async (req, res) => {
    const { token, title, message, link } = req.body;
    console.log("Received request:", req.body);
    

    const payload = {
        token,
        notification: { title, body: message },
        webpush: link ? { fcmOptions: { link }} : undefined,
    };

    try {
        await admin.messaging().send(payload); //Sending the notification to the device
        res.json({ success: true, message: 'Notification sent!' });
    } catch (error) {
        console.error("FCM error:", error);
        res.status(500).json({ success: false, error: error?.message || "Unknown error" });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);  
})
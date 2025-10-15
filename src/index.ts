import express from 'express';
import cors from 'cors'
import path from 'path';
import router from './routes';

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://photoljay-frontend.onrender.com', 'https://photoljay.com'] // Replace with actual frontend URLs
    : ['http://localhost:4200', 'http://localhost:3000'], // Allow local development
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.use('/api', router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port :  http://localhost:${PORT}`);
});

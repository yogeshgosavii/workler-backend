import { Router } from 'express';
const router = Router();

// Simple test route to verify the router is working
router.get('/test', (req, res) => {
    res.send('Test route is working');
});

export default router;

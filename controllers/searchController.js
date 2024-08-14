import User from '../models/userModel.js';


export async function searchByUsername(req, res) {
    const { username } = req.params;
    try {
        const users = await User.find({ username: { $regex: username, $options: 'i' } }).select("_id username profileImage personal_details");
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found with that username.' });
        }

        // Return the found users as JSON
        res.json(users);
    } catch (error) {
        console.error('Error searching by username:', error.message, error.stack);
        // Send a JSON error response
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

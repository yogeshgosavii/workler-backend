import { Job } from '../models/jobModel.js';
import User from '../models/userModel.js';


export async function searchByUsername(req, res) {
    const { username } = req.params;
    try {
        const users = await User.find({ username: { $regex: username, $options: 'i' } }).select("_id username profileImage personal_details  account_type company_details");
        
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

export async function searchJobsByKeyWords(req, res) {
    const { keyword } = req.query;
    console.log(keyword);
    

    try {
        const jobs = await Job.find({
            $or: [
                { job_role: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { company_name: { $regex: keyword, $options: 'i' } },
                // { location: { $regex: keyword, $options: 'i' } },
                { skills_required: { $elemMatch: { $regex: keyword, $options: 'i' } } }, // Handle array of strings
                // Add other fields as necessary
            ]
        });

        if (jobs.length === 0) {
            return res.status(404).json({ message: 'No jobs found matching the keyword.' });
        }

        res.json(jobs);
    } catch (error) {
        console.error('Error searching jobs:', error.message, error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}




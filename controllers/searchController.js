import { Job } from '../models/jobModel.js';
import User from '../models/userModel.js';
import { fetchJobsFromReedByQuery, fetchJobsFromRemotiveByQuery } from './externalJobsController.js';


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
    console.log("keyword", keyword);

    if (!keyword) {
        return res.status(400).json({ message: 'Keyword is required.' });
    }

    const stopWords = ['the', 'a', 'an', 'and', 'of', 'in', 'on', 'at', 'for', 'with', 'to', 'by', 'is', 'it', 'from'];

    let keywords = (keyword || "")
        .split(" ")
        .map(word => word ? word.trim().toLowerCase() : null)
        .filter(Boolean);

    keywords = keywords.filter(word => !stopWords.includes(word));

    if (keywords.length === 0) {
        return res.status(400).json({ message: 'Please provide more specific keywords.' });
    }

    try {
        const regexQueries = keywords.map(word => ({
            $or: [
                { job_role: { $regex: word, $options: 'i' } },
                { description: { $regex: word, $options: 'i' } },
                { company_name: { $regex: word, $options: 'i' } },
                { skills_required: { $elemMatch: { $regex: word, $options: 'i' } } }
            ]
        }));

        const finalQuery = { $or: regexQueries };

        let jobs = await Job.find(finalQuery).populate({
            path: "user",
            model: "User",
            select: "username company_details location profileImage",
        });
        const reedJobs = await fetchJobsFromReedByQuery(keywords);

        const remotiveJobs = await fetchJobsFromRemotiveByQuery(keywords);

        jobs = [...jobs,...(reedJobs || []), ...remotiveJobs,];

        if (jobs.length === 0) {
            return res.status(404).json({ message: 'No jobs found matching the keyword.' });
        }

        const rankedJobs = jobs.map(job => {
            let score = 0;

            if (keywords.some(keyword => job.job_role?.toLowerCase().includes(keyword))) score += 3;
            if (keywords.some(keyword => job.company_name?.toLowerCase().includes(keyword))) score += 2;
            if (keywords.some(keyword => job.description?.toLowerCase().includes(keyword))) score += 1;
            if (keywords.some(keyword => job.skills_required?.some(skill => skill?.toLowerCase().includes(keyword)))) score += 1;

            return { job, score };
        });

        rankedJobs.sort((a, b) => b.score - a.score);

        res.json(rankedJobs.map(({ job }) => job));
    } catch (error) {
        console.error('Error searching jobs:', error.message, error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}






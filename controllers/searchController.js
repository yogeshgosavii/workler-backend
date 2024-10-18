import { Job } from '../models/jobModel.js';
import User from '../models/userModel.js';
import { fetchJobsFromRemotiveByQuery } from './externalJobsController.js';


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

    // Define a list of basic stop words to remove
    const stopWords = ['the', 'a', 'an', 'and', 'of', 'in', 'on', 'at', 'for', 'with', 'to', 'by', 'is', 'it', 'from'];

    // Split the keyword into individual words
    let keywords = keyword.split(' ').map(word => word.trim().toLowerCase());

    // Remove stop words from the keyword array
    keywords = keywords.filter(word => !stopWords.includes(word));

    if (keywords.length === 0) {
        return res.status(400).json({ message: 'Please provide more specific keywords.' });
    }

    try {
        // Create regex queries for each keyword
        const regexQueries = keywords.map(word => ({
            $or: [
                { job_role: { $regex: word, $options: 'i' } },
                { description: { $regex: word, $options: 'i' } },
                { company_name: { $regex: word, $options: 'i' } },
                { skills_required: { $elemMatch: { $regex: word, $options: 'i' } } } // Handle array of strings
            ]
        }));

        // Combine all regex queries using $or
        const finalQuery = {
            $or: regexQueries
        };

        // Query to find jobs using the constructed query
        let jobs = await Job.find(finalQuery).populate({
            path: "user", // The field to populate
            model: "User", // The model to use for populating
            select: "username company_details location profileImage",
        });

        console.log(jobs);

        const remotiveJobs = await fetchJobsFromRemotiveByQuery(keywords)
        

        jobs = [...jobs,...remotiveJobs]
        if (jobs.length === 0) {
            return res.status(404).json({ message: 'No jobs found matching the keyword.' });
        }

        // Rank the jobs by relevance based on matching fields
        const rankedJobs = jobs.map(job => {
            let score = 0;

            // Assign higher weight to exact matches in job role and company name
            if (keywords.some(keyword => job.job_role.toLowerCase().includes(keyword))) score += 3;
            if (keywords.some(keyword => job.company_name.toLowerCase().includes(keyword))) score += 2;

            // Give lower weight to matches in description and skills
            if (keywords.some(keyword => job.description.toLowerCase().includes(keyword))) score += 1;
            if (keywords.some(keyword => job.skills_required.some(skill => skill.toLowerCase().includes(keyword)))) score += 1;

            return { job, score };
        });

        // Sort jobs by score (highest relevance first)
        rankedJobs.sort((a, b) => b.score - a.score);

        // Return the sorted jobs (with their scores stripped)
        res.json(rankedJobs.map(({ job }) => job));
    } catch (error) {
        console.error('Error searching jobs:', error.message, error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}





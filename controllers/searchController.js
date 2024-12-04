import { Job } from '../models/jobModel.js';
import User from '../models/userModel.js';
import { fetchJobsFromReed, fetchJobsFromRemotive ,fetchAllJobs } from './externalJobsController.js';


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

export async function searchUserByKeyword(req, res) {
    const { keyword } = req.query;


    // Define stopWords to filter out common words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'to', 'with', 'by', 'for', 'of'];

    // Process and filter keywords
    const keywords = keyword
        ?.split(" ")
        ?.map(word => word.trim()) // Trim and convert to lowercase
        ?.filter(Boolean) // Remove empty/null values
        ?.filter(word => !stopWords.includes(word)); // Remove stop words


    if (!keyword || keywords.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty keyword provided.' });
    }

    try {
        const users = await User.find({
            $or: [
                { username: { $regex: keyword, $options: 'i' } }, // Case-insensitive match for username
                {
                    tags: {
                        $elemMatch: { $regex: new RegExp(keywords.join('|'), 'i') } // Case-insensitive tags match
                    }
                }            ]
        }).select("_id username profileImage personal_details account_type company_details");


        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found with the given keyword.' });
        }

        // Return the found users as JSON
        res.json(users);
    } catch (error) {
        console.error('Error searching by keyword:', error.message, error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function searchJobsByKeyWords(req, res) {
    const { keyword, page = 1, limit = 10 } = req.query;

    const stopWords = ['the', 'a', 'an', 'and', 'of', 'in', 'on', 'at', 'for', 'with', 'to', 'by', 'is', 'it', 'from'];

    let keywords = keyword
        .split(" ")
        .map(word => word ? word.trim().toLowerCase() : null)
        .filter(Boolean)
        .filter(word => !stopWords.includes(word));

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

        const skip = (page - 1) * limit;

        let jobs = await Job.find(finalQuery)
            .skip(skip)
            .limit(limit)
            .populate({
                path: "user",
                model: "User",
                select: "username company_details location profileImage",
            });

        const allJobs = await fetchAllJobs(keywords, limit, page);

        // Normalize external jobs
        const externalJobs = allJobs.map(externalJob => ({
            ...externalJob,
        }));

        jobs = [...jobs, ...externalJobs];

        if (jobs.length === 0) {
            return res.status(404).json({ message: 'No jobs found matching the keyword.' });
        }

        const rankedJobs = jobs.map(job => {
            let score = 0;

            if (job.job_role && keywords && keywords?.some(keyword => job.job_role.toLowerCase().includes(keyword))) score += 3;
            if (job.company_name && keywords && keywords?.some(keyword => job.company_name.toLowerCase().includes(keyword))) score += 2;
            if (job.description && keywords && keywords?.some(keyword => job.description.toLowerCase().includes(keyword))) score += 1;
            if (job.skills_required && keywords && job.skills_required.some(skill => skill && keywords?.some(keyword => skill.toLowerCase().includes(keyword)))) score += 1;

            return { job, score };
        });

        rankedJobs.sort((a, b) => b.score - a.score);

        res.json({
            jobs: rankedJobs.map(({ job }) => job),
            totalResults: rankedJobs.length,  // Correct total count of ranked jobs
            page,
            limit
        });
    } catch (error) {
        console.error('Error searching jobs:', error.message, error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}







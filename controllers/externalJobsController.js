// controllers/externalJobController.js
import asyncHandler from 'express-async-handler';
import axios from 'axios';

// Function to fetch jobs from Remotive
const fetchJobsFromRemotive = async (query) => {
  try {
    const response = await axios.get('https://remotive.com/api/remote-jobs', {
      params: query, // Use the query parameters from the request
    });

    // Check for jobs in the response
    return response.data.jobs || []; // Return jobs or an empty array
  } catch (error) {
    console.error("Error fetching jobs from Remotive:", error.message);
    throw new Error('Failed to fetch jobs from Remotive');
  }
};

// Main function to aggregate jobs from Remotive
const transformJobData = (apiJob) => {
  // Extract salary range from string and convert to numbers
  const salaryRange = apiJob.salary.match(/\$([0-9,]+) - \$([0-9,]+)/);
  const min_salary = salaryRange ? parseInt(salaryRange[1].replace(/,/g, '')) : null;
  const max_salary = salaryRange ? parseInt(salaryRange[2].replace(/,/g, '')) : null;

  // Convert location to a Location object (you can customize it as needed)
  const location = {
    country: apiJob.candidate_required_location || null,
    // Add more fields to the location if needed (e.g., city, state)
  };

  return {
    user: null, // Populate this with the actual user if needed
    _id : apiJob.id,
    job_role: apiJob.title || '',
    min_salary,
    max_salary,
    source: 'Remotive',
    description: apiJob.description || '',
    company_name: apiJob.company_name || '',
    location,
    job_type: apiJob.job_type || '',
    skills_required: apiJob.tags || [],
    experience_type: null, // Set if available in the API response or leave null
    min_experience: null,  // Same as above
    max_experience: null,  // Same as above
    job_tags: apiJob.tags || [],
    company_logo: apiJob.company_logo || '',
    job_url: apiJob.url || '',
    job_source: 'Remotive',
    candidates_applied: [], // Empty for now
    candidate_limit: null, // Set if you want to enforce a candidate limit
  };
};

export const fetchAllJobs = async (query) => {
  console.log('Received query:', query); // Log the query parameters
  try {
    const remotiveJobs = await fetchJobsFromRemotive(query); // Fetch jobs using query

    // Check if remotiveJobs is an array
    if (!Array.isArray(remotiveJobs)) {
      console.error('Invalid response from Remotive:', remotiveJobs);
      throw new Error('Failed to fetch jobs from Remotive');
    }

    // Transform the jobs into your schema format
    const transformedJobs = remotiveJobs.map(transformJobData);

    // Return the transformed jobs
    return transformedJobs;
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    throw new Error('Failed to fetch jobs');
  }
};


export const getExternalJobs = fetchAllJobs;

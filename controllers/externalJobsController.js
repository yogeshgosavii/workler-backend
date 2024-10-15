// controllers/externalJobController.js
import asyncHandler from 'express-async-handler';
import axios from 'axios';

// Function to fetch jobs from Remotive
const fetchJobsFromRemotive = async (query) => {
  try {
    const response = await axios.get('https://remotive.com/api/remote-jobs', {
      params: query, // Use the query parameters from the request
    });
    return response.data.jobs || []; // Return jobs or an empty array
  } catch (error) {
    console.error("Error fetching jobs from Remotive:", error.message);
    throw new Error('Failed to fetch jobs from Remotive');
  }
};

// Function to fetch jobs from Adzuna
const fetchJobsFromAdzuna = async (query) => {
  try {
    const response = await axios.get('https://api.adzuna.com/v1/api/jobs/us/search/1', {
      params: query, // Use the query parameters from the request
    });
    return response.data.results || []; // Return jobs or an empty array
  } catch (error) {
    console.error("Error fetching jobs from Adzuna:", error.message);
    throw new Error('Failed to fetch jobs from Adzuna');
  }
};

// Function to fetch jobs from Coresignal
const fetchJobsFromCoresignal = async (query) => {
  try {
    const response = await axios.get('https://api.coresignal.com/jobs', {
      headers: {
        'Authorization': 'Bearer YOUR_CORESIGNAL_API_KEY' // Add your API key here
      },
      params: query,
    });
    return response.data.results || []; // Return jobs or an empty array
  } catch (error) {
    console.error("Error fetching jobs from Coresignal:", error.message);
    throw new Error('Failed to fetch jobs from Coresignal');
  }
};

// Function to fetch jobs from Reed
const fetchJobsFromReed = async (query) => {
  try {
    const response = await axios.get('https://www.reed.co.uk/api/1.0/search?keywords=accountant&location=london&employerid=123&distancefromlocation=15', {
      headers: {
        'Authorization': `Bearer fd6b6531-c35b-492d-a029-9d9963b908e7`, // Add your Reed API key here
      },
      params: query,
    });
    return response.data.results || []; // Return jobs or an empty array
  } catch (error) {
    console.error("Error fetching jobs from Reed:", error.message);
    throw new Error('Failed to fetch jobs from Reed');
  }
};

// Transform API job data into the unified schema format
const transformJobData = (apiJob, source) => {
  const salaryRange = apiJob.salary ? apiJob.salary.match(/\$([0-9,]+) - \$([0-9,]+)/) : null;
  const min_salary = salaryRange ? parseInt(salaryRange[1].replace(/,/g, '')) : null;
  const max_salary = salaryRange ? parseInt(salaryRange[2].replace(/,/g, '')) : null;

  const location = {
    country: apiJob.candidate_required_location || apiJob.location || null,
  };

  return {
    user: null,
    _id: apiJob.id || apiJob.job_id || apiJob.key,
    job_role: apiJob.title || '',
    min_salary,
    max_salary,
    source,
    description: apiJob.description || '',
    company_name: apiJob.company_name || apiJob.company || '',
    location,
    job_type: apiJob.job_type || '',
    skills_required: apiJob.tags || apiJob.skills || [],
    experience_type: null,
    min_experience: null,
    max_experience: null,
    job_tags: apiJob.tags || [],
    company_logo: apiJob.company_logo || '',
    job_url: apiJob.url || '',
    job_source: source,
    candidates_applied: [],
    candidate_limit: null,
  };
};

// Function to fetch and aggregate jobs from multiple sources
export const fetchAllJobs = async (query) => {
  console.log('Received query:', query);
  try {
    // Fetch jobs from various sources
    const remotiveJobs = await fetchJobsFromRemotive(query);
    // const adzunaJobs = await fetchJobsFromAdzuna(query);
    // const coresignalJobs = await fetchJobsFromCoresignal(query);
    // const reedJobs = await fetchJobsFromReed(query); // Added Reed jobs

    // Transform the jobs into your schema format
    const transformedRemotiveJobs = remotiveJobs.map(job => transformJobData(job, 'Remotive'));
    // const transformedAdzunaJobs = adzunaJobs.map(job => transformJobData(job, 'Adzuna'));
    // const transformedCoresignalJobs = coresignalJobs.map(job => transformJobData(job, 'Coresignal'));
    // const transformedReedJobs = reedJobs.map(job => transformJobData(job, 'Reed')); // Transform Reed jobs

    // Aggregate jobs from all sources
    const allJobs = [
      ...transformedRemotiveJobs,
      // ...transformedAdzunaJobs,
      // ...transformedCoresignalJobs,
      // ...transformedReedJobs, // Added Reed jobs to the aggregation
    ];

    return allJobs;
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    throw new Error('Failed to fetch jobs');
  }
};

export const getExternalJobs = fetchAllJobs;

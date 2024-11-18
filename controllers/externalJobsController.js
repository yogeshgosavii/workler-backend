// controllers/externalJobController.js
import asyncHandler from 'express-async-handler';
import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config()

// Function to fetch jobs from Remotive
const fetchJobsFromRemotive = async () => {
  try {
    const response = await axios.get('https://remotive.com/api/remote-jobs',);
    return response.data.jobs || []; // Return jobs or an empty array
  } catch (error) {
    console.error("Error fetching jobs from Remotive:", error.message);
    throw new Error('Failed to fetch jobs from Remotive');
  }
};


export const fetchJobsFromRemotiveByQuery = async (query) => {
  try {
    console.log(query);
    
    const encodedQuery = encodeURIComponent(query);
    console.log(encodedQuery);
    
    const response = await axios.get('https://remotive.com/api/remote-jobs?search='+encodedQuery,);
    
    const transFormedJobs = response.data.jobs.map(job=>transformJobData(job,"Remotive"))
    // console.log("search",transFormedJobs);

    return transFormedJobs; // Return jobs or an empty array
  } catch (error) {
    console.error("Error fetching jobs from Remotive:", error.message);
    throw new Error('Failed to fetch jobs from Remotive');
  }
};

export const fetchJobsFromReedByQuery = async (query) => {
  try {
    console.log(query);
    const apiKey = 'fd6b6531-c35b-492d-a029-9d9963b908e7'; // Your API Key

    const encodedQuery = encodeURIComponent(query);
    console.log(encodedQuery);
    
    const response = await axios.get(`https://www.reed.co.uk/api/1.0/search?keywords=frontend`, {
      auth: {
        username: apiKey, // Replace with your Reed API key
        password: '', // Password should be left empty
      },
    })

    
    
    const transFormedJobs = response.data?.results.map(job=>transformJobDataReed(job,""))
    console.log("search",transFormedJobs);

    return transFormedJobs; // Return jobs or an empty array
  } catch (error) {
    console.error("Error fetching jobs from Reeds:", error.message);
  }
};

const jobCache = {};

export const fetchJobDetailsFromRemotiveById = async (jobId) => {
  // Check if job details are already in cache
  if (jobCache[jobId]) {
    console.log('Fetching job details from cache:', jobId);
    return jobCache[jobId]; // Return from cache
  }

  try {
    // Fetch all jobs and find the specific job ID (if direct fetching isn't available)
    const response = await axios.get('https://remotive.com/api/remote-jobs');
    const jobs = response.data.jobs || [];
    console.log("jobs",jobs[0]);
    console.log("jobId",jobId);
    
    // Filter for the specific job ID
    const job = jobs.filter(job => job.id == jobId);
    console.log("job",job);
    

    // Transform the job data if found
    if (job.length != 0) {
      const transformedData = transformJobData(job[0], 'Remotive');
      console.log(transformedData);
      
      jobCache[jobId] = transformedData; // Store in cache
      return transformedData; // Return the job details
    }

    return null; // Return null if the job is not found
  } catch (error) {
    console.error("Error fetching job details:", error.message);
    throw new Error('Failed to fetch job details');
  }
};

export const fetchJobByIdFromReed = async (jobId) => {
  console.log("reed",jobId);
  
  const apiKey = process.env.REED_API_KEY; // Your API Key

  try {
    const response = await axios.get(` https://www.reed.co.uk/api/1.0/jobs/${jobId}`, {
      auth: {
        username: apiKey, // Replace with your Reed API key
        password: '', // Password should be left empty
      },
    });

    console.log(response);
    
  
    const transFormedJobs = transformJobDataReed(response.data,"Reed")
    // console.log("search",transFormedJobs);

    // Return the job details or handle as needed
    console.log("Job Details:", transFormedJobs);
    return transFormedJobs;
  } catch (error) {
    console.error("Error fetching job by ID from Reed:", error.message);
    throw new Error('Failed to fetch job details from Reed');
  }
};

// Function to fetch jobs from Reed
const fetchJobsFromReed = async () => {
  try {
    const apiKey = process.env.REED_API_KEY; // Your API Key
    const response = await axios.get(
      'https://www.reed.co.uk/api/1.0/search',
      {
        auth: {
          username: apiKey, // Use the API key as the username
          password: '', // Leave the password field empty
        },
      }
    );
    console.log("Jobs:", response.data.results);
    return response.data.results || []; // Return jobs or an empty array
  } catch (error) {
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
    } else {
      console.error("Error message:", error.message);
    }
    throw new Error('Failed to fetch jobs from Reed');
  }
};

// Transform API job data into the unified schema format
const transformJobData = (apiJob, source) => {
  // console.log(apiJob);
  const salaryRange = apiJob.salary ? apiJob.salary.match(/([₹$€£¥]?)\s?([0-9,]+(?:\.[0-9]{1,2})?)\s?-\s?([₹$€£¥]?)\s?([0-9,]+(?:\.[0-9]{1,2})?)/) : null;
  const min_salary = salaryRange ? parseFloat(salaryRange[2].replace(/,/g, '')) : null;
  const max_salary = salaryRange ? parseFloat(salaryRange[4].replace(/,/g, '')) : null;
  
  // Extract currency type if available, defaulting to 'USD'
  const currency_type = salaryRange ? (salaryRange[1] || salaryRange[3] || 'USD') : null;
  

  // Determine salary type, default to 'per annum' if not provided
  const salary_type = apiJob.salary_type || (apiJob.salary ?(apiJob.salary.split("per")[1]) : null);

  const location = {
    country: apiJob.candidate_required_location || apiJob.location || null,
  };

  return {
    user: null,
    _id: apiJob.id || apiJob.job_id || apiJob.key,
    job_role: apiJob.title || '',
    min_salary,
    max_salary,
    currency_type,
    salary_type,
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

const transformJobDataReed = (apiJob, source) => {
  const salaryRange = {
    min_salary: apiJob.minimumSalary || null,
    max_salary: apiJob.maximumSalary || null,
    currency_type: apiJob.currency || 'GBP', // Default to GBP if not specified
  };

  const location = {
    country: apiJob.locationName || null,
  };

  return {
    user: null,
    _id: apiJob.jobId || null,
    job_role: apiJob.jobTitle || '',
    ...salaryRange,
    salary_type: 'per annum', // Assuming annual salary as per Reed data
    source,
    description: apiJob.jobDescription || '',
    company_name: apiJob.employerName || '',
    location,
    job_type: null, // Reed doesn't provide job type directly; can be enriched from elsewhere
    skills_required: [], // No explicit field for skills in the Reed data
    experience_type: null,
    min_experience: null,
    max_experience: null,
    job_tags: [], // Reed doesn't provide tags directly
    company_logo: '', // No logo field in the Reed data
    job_url: apiJob.jobUrl || '',
    job_source: source,
    candidates_applied: [], // Optional; may need another source to fetch candidates
    candidate_limit: null,
    expiration_date: apiJob.expirationDate || null,
    applications: apiJob.applications || 0, // Applications count from Reed data
    posting_date: apiJob.date || null,
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
    const reedJobs = await fetchJobsFromReed(); // Added Reed jobs

    // Transform the jobs into your schema format
    const transformedRemotiveJobs = remotiveJobs.map(job => transformJobData(job, 'Remotive'));
    // const transformedAdzunaJobs = adzunaJobs.map(job => transformJobData(job, 'Adzuna'));
    // const transformedCoresignalJobs = coresignalJobs.map(job => transformJobData(job, 'Coresignal'));
    const transformedReedJobs = reedJobs.map(job => transformJobDataReed(job, 'Reed')); // Transform Reed jobs

    // Aggregate jobs from all sources
    const allJobs = [
      ...transformedReedJobs, // Added Reed jobs to the aggregation
      ...transformedRemotiveJobs,
      // ...transformedAdzunaJobs,
      // ...transformedCoresignalJobs,
    ];

    return allJobs;
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    throw new Error('Failed to fetch jobs');
  }
};

export const getExternalJobs = fetchAllJobs;

import axios from "axios";

// Cache for job details by ID to improve performance
const jobCache = {};

// Function to transform Remotive job data

// Function to fetch jobs from Remotive with pagination
export const fetchJobsFromRemotive = async (query, limit = 10, page = 1) => {
  console.log("remotiveJobs query",query);
  
  try {
    const response = await axios.get("https://remotive.com/api/remote-jobs", {
      params: {
        search: encodeURIComponent(query?.join(',')),
        limit,
      },
    });
    // console.log("data responsive",response.data.jobs)

    return response.data.jobs || []; // Return jobs or an empty array
  } catch (error) {
    console.error("Error fetching jobs from Remotive:", error.message);
    throw new Error("Failed to fetch jobs from Remotive");
  }
};

// Function to fetch jobs from Reed with pagination
export const fetchJobsFromReed = async (query, limit = 10, page = 1) => {
  try {
    const apiKey = process.env.REED_API_KEY; // API Key
    if (!apiKey) {
      console.error("REED_API_KEY is missing or undefined");
      throw new Error("REED_API_KEY is missing");
    }

    console.log("Query provided:", query);
    console.log("API Key:", apiKey);

    let response;

    const queryIsValid = query && Array.isArray(query) && query.length > 0 && query[0];
    const params = queryIsValid
      ? {
          keywords: query,
          location : "india",
          resultsToSkip: page * limit,
          resultsToTake: limit,
        }
      : {
          resultsToSkip: page * limit,
          resultsToTake: limit,
        };

    console.log("API Params:", params);

    response = await axios.get(`https://www.reed.co.uk/api/1.0/search`, {
      auth: {
        username: apiKey,
        password: "", // Leave the password empty
      },
      params,
    });

    return response?.data?.results || [];
  } catch (error) {
    if (error.response) {
      console.error("API Response Error:", error.response.data);
      console.error("Status Code:", error.response.status);
    } else {
      console.error("Error Message:", error.message);
    }
    throw new Error("Failed to fetch jobs from Reed");
  }
};


// Function to fetch all jobs from different sources with pagination
export const fetchAllJobs = async (query, limit = 10, page = 1) => {
  console.log("Received query:", query);
  try {
    // Fetch jobs from various sources with pagination support
    const remotiveJobs = await fetchJobsFromRemotive(query, limit, page);
    const reedJobs = await fetchJobsFromReed(query, limit, page); // Added pagination

    // Transform the jobs into your schema format
    const transformedRemotiveJobs = remotiveJobs.map((job) =>
      transformJobData(job, "Remotive")
    );
    const transformedReedJobs = reedJobs.map((job) =>
      transformJobDataReed(job, "Reed")
    ); // Transform Reed jobs

    // Aggregate jobs from all sources
    const allJobs = [
      ...transformedReedJobs,
      ...transformedRemotiveJobs,
    ];

    return allJobs;
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    throw new Error("Failed to fetch jobs");
  }
};

// Function to fetch job details by ID from Remotive with caching
export const fetchJobDetailsFromRemotiveById = async (jobId) => {
  // Check if job details are already in cache
  if (jobCache[jobId]) {
    console.log("Fetching job details from cache:", jobId);
    return jobCache[jobId]; // Return from cache
  }

  try {
    // Fetch all jobs and find the specific job ID (if direct fetching isn't available)
    const response = await axios.get("https://remotive.com/api/remote-jobs");
    const jobs = response.data.jobs || [];
    console.log("jobs", jobs[0]);
    console.log("jobId", jobId);

    // Filter for the specific job ID
    const job = jobs.find((job) => job.id == jobId);
    console.log("job", job);

    // Transform the job data if found
    if (job) {
      const transformedData = transformJobData(job, "Remotive");
      console.log(transformedData);

      jobCache[jobId] = transformedData; // Store in cache
      return transformedData; // Return the job details
    }

    return null; // Return null if the job is not found
  } catch (error) {
    console.error("Error fetching job details:", error.message);
    throw new Error("Failed to fetch job details");
  }
};

// Function to fetch job details by ID from Reed with caching
export const fetchJobByIdFromReed = async (jobId) => {
  console.log("reed", jobId);

  const apiKey = process.env.REED_API_KEY; // Your API Key

  // Check if job details are already in cache
  if (jobCache[jobId]) {
    console.log("Fetching job details from cache:", jobId);
    return jobCache[jobId]; // Return from cache
  }

  try {
    const response = await axios.get(
      `https://www.reed.co.uk/api/1.0/jobs/${jobId}`,
      {
        auth: {
          username: apiKey,
          password: "", // Leave the password field empty
        },
      }
    );

    console.log("data", response.data);

    if (response.data.jobTitle) {
      const transformedJob = transformJobDataReed(response.data, "Reed");
      console.log("Job Details:", transformedJob);

      // Cache the transformed job data
      jobCache[jobId] = transformedJob;
      return transformedJob;
    } else {
      return null; // Return null if the job is not found
    }
  } catch (error) {
    console.error("Error fetching job by ID from Reed:", error.message);
  }
};

// Transform API job data into the unified schema format
const transformJobData = (apiJob, source) => {
  // console.log(apiJob);
  const salaryRange = apiJob.salary
    ? apiJob.salary.match(
        /([₹$€£¥]?)\s?([0-9,]+(?:\.[0-9]{1,2})?)\s?-\s?([₹$€£¥]?)\s?([0-9,]+(?:\.[0-9]{1,2})?)/
      )
    : null;
  const min_salary = salaryRange
    ? parseFloat(salaryRange[2].replace(/,/g, ""))
    : null;
  const max_salary = salaryRange
    ? parseFloat(salaryRange[4].replace(/,/g, ""))
    : null;

  // Extract currency type if available, defaulting to 'USD'
  const currency_type = salaryRange
    ? salaryRange[1] || salaryRange[3] || "USD"
    : null;

  // Determine salary type, default to 'per annum' if not provided
  const salary_type =
    apiJob.salary_type ||
    (apiJob.salary ? apiJob.salary.split("per")[1] : null);

  const location = {
    country: apiJob.candidate_required_location || apiJob.location || null,
  };

  return {
    user: null,
    _id: apiJob.id || apiJob.job_id || apiJob.key,
    job_role: apiJob.title || "",
    min_salary,
    max_salary,
    currency_type,
    salary_type,
    source,
    description: apiJob.description || "",
    company_name: apiJob.company_name || apiJob.company || "",
    location,
    job_type: apiJob.job_type || "",
    skills_required: apiJob.tags || apiJob.skills || [],
    experience_type: null,
    min_experience: null,
    max_experience: null,
    job_tags: apiJob.tags || [],
    company_logo: apiJob.company_logo || "",
    job_url: apiJob.url || "",
    job_source: source,
    candidates_applied: [],
    candidate_limit: null,
  };
};

const transformJobDataReed = (apiJob, source) => {
  const salaryRange = {
    min_salary: apiJob.minimumSalary || null,
    max_salary: apiJob.maximumSalary || null,
    currency_type: apiJob.currency || "GBP", // Default to GBP if not specified
  };

  const location = {
    country: apiJob.locationName || null,
  };

  return {
    user: null,
    _id: apiJob.jobId || null,
    job_role: apiJob.jobTitle || "",
    ...salaryRange,
    salary_type: "per annum", // Assuming annual salary as per Reed data
    source,
    description: apiJob.jobDescription || "",
    company_name: apiJob.employerName || "",
    location,
    job_type: null, // Reed doesn't provide job type directly; can be enriched from elsewhere
    skills_required: [], // No explicit field for skills in the Reed data
    experience_type: null,
    min_experience: null,
    max_experience: null,
    job_tags: [], // Reed doesn't provide tags directly
    company_logo: "", // No logo field in the Reed data
    job_url: apiJob.jobUrl || "",
    job_source: source,
    candidates_applied: [], // Optional; may need another source to fetch candidates
    candidate_limit: null,
    expiration_date: apiJob.expirationDate || null,
    applications: apiJob.applications || 0, // Applications count from Reed data
    posting_date: apiJob.date || null,
  };
};

// Function to fetch and aggregate jobs from multiple sources
// export const fetchAllJobs = async (query) => {
//   console.log("Received query:", query);
//   try {
//     // Fetch jobs from various sources
//     const remotiveJobs = await fetchJobsFromRemotive(query);
//     // const adzunaJobs = await fetchJobsFromAdzuna(query);
//     // const coresignalJobs = await fetchJobsFromCoresignal(query);
//     const reedJobs = await fetchJobsFromReed(); // Added Reed jobs

//     // Transform the jobs into your schema format
//     const transformedRemotiveJobs = remotiveJobs.map((job) =>
//       transformJobData(job, "Remotive")
//     );
//     // const transformedAdzunaJobs = adzunaJobs.map(job => transformJobData(job, 'Adzuna'));
//     // const transformedCoresignalJobs = coresignalJobs.map(job => transformJobData(job, 'Coresignal'));
//     const transformedReedJobs = reedJobs.map((job) =>
//       transformJobDataReed(job, "Reed")
//     ); // Transform Reed jobs

//     // Aggregate jobs from all sources
//     const allJobs = [
//       ...transformedReedJobs, // Added Reed jobs to the aggregation
//       ...transformedRemotiveJobs,
//       // ...transformedAdzunaJobs,
//       // ...transformedCoresignalJobs,
//     ];

//     return allJobs;
//   } catch (error) {
//     console.error("Error fetching jobs:", error.message);
//     throw new Error("Failed to fetch jobs");
//   }
// };

export const getExternalJobs = fetchAllJobs;

const Job = require('../models/jobModel');
const { ApifyClient } = require('apify-client');

const token = 'apify_api_Su0u7qrtHM8bNH2bkQtRy8zndfJfhf0g0oAC';
const actorId1 = 'tUYf9qQlYRXHkxGQ3';
const actorId2 = 'fq3JGocNzvVGB8vTi';

const input1 = {
  "query": "Data Engineer",
  "location": "New York, NY",
  "experienceLevel": "entry_level",
  "sort": "date"
};

const input2 = {
  "keyword": "Software Developer",
  "location": "Pune",
  "country": "India",
  "limit": 30
};

const client = new ApifyClient({ token });

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (error) {
        res.status(500).send('Error fetching jobs');
    }
};

exports.createJob = async (req, res) => {
    const { title, description } = req.body;
    try {
        const job = new Job({ title, description });
        await job.save();
        res.status(201).send('Job created successfully');
    } catch (error) {
        res.status(400).send('Error creating job');
    }
};

const fetchAndMapJobs = async (actorId, input, mapFunction) => {
  const run = await client.actor(actorId).call(input);
  if (run.defaultDatasetId) {
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    return items.map(mapFunction);
  }
  return [];
};

const mapJobFromIndeed = (item) => {
  return {
    header: {
      ageInDays: item.ageInDays || 0,
      portal: 'Indeed',
      portal_Image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAflBMVEUAAAD///////////////////////////////////////////////+/zuZvkMZQd7pAa7Sgtdnv8/gAOptgg8AgUqcgU6evweCAnc0QRqF/nc3v8vhwkMcwXq3f5vLP2uz////f5/JfhMB/nM0wX66AnM1PeLqPqdOftdrv8/mN6/jEAAAAIXRSTlMAEGCfz+//XyCQj98w/////////////////////////6AQ1BAWAAABD0lEQVR4AYWThRZCIQxAR+11h939/z+oHECHGNd4sbvR8IJxIRWikiJiEBInCl+IGHxYim+kfnqGARkpkj/jRVnVVdMaIw/yi7qr+7IaxolXg7n4dDZfGHEojGFG4/q3XK3RsSE9jV3+SqevC6ToRrbmdjc84m3ddeOOCAkAQ8Oo6++7BzURFANuB3DQ/8dOgwTuWjjpAnjW8YEKAqS5KU0dLVyoIEGZYdnOr8veH4YCN+5vWGGBVtxc68IXFFLqrus8QYH8LUjY/hYE8N9CBEz9FBhA8ksQZLmpQJeblAiFxNtyoZCxYNMvu252CzY+2fa3fVU84/nfg0NgyXs8YeATb0lUJTGEML61x5+T7DuGyRy8BcS3+wAAAABJRU5ErkJggg==',
      divisionEmployerName: item.company || null,
      easyApply: false,
      employer: { id: null, shortName: item.company || "" },
      employerNameFromSearch: item.company,
      goc: item.experience || "Any",
      jobCountryId: null,
      jobLink: item.link || "",
      jobTitleText: item.displayTitle || "",
      locationName: item.location || "",
      locationType: item.remoteWorkModel || "",
      payCurrency: "",
      payPeriod: "",
      payPeriodAdjustedPay: item.minSalary && item.maxSalary ? (item.minSalary < item.maxSalary ? item.minSalary+" - "+item.maxSalary : item.minSalary) : "Not Disclosed",
      rating: item.companyRating || null,
      salarySource: ""
    },
    job: {
      descriptionFragments: [],
      jobTitleText: item.displayTitle || "",
      listingId: item.id || null
    },
    overview: {
      shortName: item.company || "",
      squareLogoUrl: item.companyBrandingAttributes?.logoUrl || ""
    }
  };
};

const mapJobFromGlassdoor = (item) => {
  return {
    header: {
      ageInDays: item.header.ageInDays || "",
      portal: 'Glassdoor',
      portal_Image: 'https://apify-image-uploads-prod.s3.us-east-1.amazonaws.com/fq3JGocNzvVGB8vTi/VpsLMUeySBv1VrMA7-glassdoor.jpg',
      divisionEmployerName: item.company || null,
      easyApply: false,
      employer: { id: null, shortName: item.header.shortName || "" },
      employerNameFromSearch: item.header.employerNameFromSearch,
      goc: item.experience || "Any",
      jobCountryId: null,
      jobLink: item.header.jobLink || "",
      jobTitleText: item.header.jobTitleText || "",
      locationName: item.header.locationName || "",
      locationType: item.remoteWorkModel || "",
      payCurrency: "",
      payPeriod: "",
      payPeriodAdjustedPay: item.header.payPeriodAdjustedPay?.p10 || "Not disclosed",
      rating: item.companyRating || null,
      salarySource: ""
    },
    job: {
      descriptionFragments: item.job.descriptionFragments,
      jobTitleText: item.displayTitle || "",
      listingId: item.id || null
    },
    overview: {
      shortName: item.company || "",
      squareLogoUrl: item.overview.squareLogoUrl || ""
    }
  };
};

exports.getJobsFromThirdParty = async (req, res) => {
  try {
    const [jobsFromIndeed, jobsFromGlassdoor] = await Promise.all([
      fetchAndMapJobs(actorId1, input1, mapJobFromIndeed),
      fetchAndMapJobs(actorId2, input2, mapJobFromGlassdoor)
    ]);

    const jobs = [...jobsFromIndeed, ...jobsFromGlassdoor];
    jobs.sort((a, b) => a.header.ageInDays - b.header.ageInDays);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).send('Error fetching jobs');
  }
};

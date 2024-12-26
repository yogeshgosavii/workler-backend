import express from 'express';
import Report from '../models/reportModel.js'; // Assuming you have a Report model
import { Schema as _Schema } from 'mongoose';

// Get all reports
export async function getAllReports(req, res) {
    try {
        const reports = await Report.find()
        .populate({
            path: "reportedUser", // The field to populate
            model: "User", // The model to use for populating
            select:
              "username personal_details company_details location profileImage",
          })
          .populate({
            path: "reportedBy", // The field to populate
            model: "User", // The model to use for populating
            select:
              "username personal_details company_details location profileImage",
          })
        ;
        console.log("rep",reports)
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reports: ' + err.message });
    }
}

// Get one report
export async function getOneReport(req, res) {
    try {
        res.json(res.report);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching report: ' + err.message });
    }
}

// Create a report
export async function createReport(req, res) {
    console.log('Creating a new report', req.body);

    const report = new Report({
        reportType: req.body.reportType,
        reason: req.body.reason,
        reportedContent: req.body.reportedContent,
        reportedUser : req.body.reportedUser,
        reportedBy: req.body.reportedBy
    });


    try {
        const newReport = await report.save();
        res.status(201).json(newReport);
    } catch (err) {
        res.status(400).json({ message: 'Error creating report: ' + err.message });
    }
}

// Update a report
export async function updateReport(req, res) {
    if (req.body.title != null) {
        res.report.title = req.body.title;
    }
    if (req.body.description != null) {
        res.report.description = req.body.description;
    }
    if (req.body.date != null) {
        res.report.date = req.body.date;
    }

    try {
        const updatedReport = await res.report.save();
        res.json(updatedReport);
    } catch (err) {
        res.status(400).json({ message: 'Error updating report: ' + err.message });
    }
}

// Delete a report
export async function deleteReport(req, res) {
    try {
        await res.report.remove();
        res.json({ message: 'Deleted Report' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting report: ' + err.message });
    }
}

// Middleware to get report by ID
export async function getReport(req, res, next) {
    let report;
    try {
        report = await Report.findById(req.params.id);
        if (report == null) {
            return res.status(404).json({ message: 'Cannot find report' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Error fetching report: ' + err.message });
    }

    res.json(report);
}

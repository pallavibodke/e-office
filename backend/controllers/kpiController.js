const KPI = require('../models/KPI');

exports.submitKPI = async (req, res) => {

try {

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const {
    employeeId,
    employeeName,
    category,
    taskTitle,
    description,
    progress
    } = req.body;

    const newKPI = new KPI({

    employeeId,
    employeeName,
    category,
    taskTitle,
    description,
    progress,

    uploadedFile: req.file
        ? req.file.filename
        : null,

    reviewStatus: "Pending"
    });

    await newKPI.save();

    res.status(201).json({
    success: true,
    message: "KPI Submitted Successfully",
    data: newKPI
    });

} catch (error) {

    console.log(error);

    res.status(500).json({
    error: error.message
    });
}
};
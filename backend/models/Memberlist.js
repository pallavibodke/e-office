const mongoose = require('mongoose');

const memberListSchema = new mongoose.Schema(
{
    projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
    },

    uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
    },

    fileName: {
    type: String,
    required: true
    },

    filePath: {
    type: String,
    required: true
    },

    fileType: {
    type: String
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model('MemberList', memberListSchema);
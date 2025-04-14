const mongoose = require('mongoose');

const MassageshopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    telephone: {
        type: String
    },
    openTime: {
        type: String,
        required: [true, 'Please specify opening time']
    },
    closeTime: {
        type: String,
        required: [true, 'Please specify closing time']
    },
    numberOfMassagers: {
        type: Number,
        required: [true, 'Please specify number of massagers'],
        min: [1, 'There must be at least 1 massager']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Reverse populate with virtuals
MassageshopSchema.virtual("reservations", {
    ref: "Reservation",
    localField: "_id",
    foreignField: "massageshop",
    justOne: false
});

module.exports = mongoose.model('Massageshop', MassageshopSchema);

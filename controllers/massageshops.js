const Reservation = require('../models/Reservation');
const Massageshop = require('../models/Massageshop');

//@desc     Get all massageshops
//@route    GET /api/v1/massageshops
//@access   Public
exports.getMassageshops = async (req, res, next) => {
    let query;

    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    console.log(reqQuery)

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|le|lte|in)\b/g, match => `$${match}`);
    query = Massageshop.find(JSON.parse(queryStr)).populate("reservations");

    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(" ");
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Massageshop.countDocuments();
    query = query.skip(startIndex).limit(limit);

    try {
        const massageshops = await query;

        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }
        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({
            success: true,
            count: massageshops.length,
            data: massageshops
        });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

//@desc     Get single massageshops
//@route    GET /api/v1/massageshops/:id
//@access   Public
exports.getMassageshop = async (req, res, next) => {
    try {
        const massageshop = await Massageshop.findById(req.params.id);

        if (!massageshop) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({
            success: true,
            data: massageshop
        });
    } catch (err) {
        res.status(400).json({ success: false })
    }
};

//@desc     Create new massageshops
//@route    POST /api/v1/massageshops
//@access   Private
exports.createMassageshop = async (req, res, next) => {
    const massageshop = await Massageshop.create(req.body);
    res.status(201).json({
        success: true,
        data: massageshop
    });
};

//@desc     Update massageshops
//@route    PUT /api/v1/massageshops/:id
//@access   Private
exports.updateMassageshop = async (req, res, next) => {
    try {
        const massageshop = await Massageshop.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!massageshop) {
            res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: massageshop });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

//@desc     Delete massageshops
//@route    DELETE /api/v1/massageshops/:id
//@access   Private
exports.deleteMassageshop = async (req, res, next) => {
    try {
        const massageshop = await Massageshop.findById(req.params.id);
        if (!massageshop) {
            res.status(404).json({ success: false, message: `Massageshop not found with id of ${req.params.id}` });
        }
        await Reservation.deleteMany({ massageshop: req.params.id });
        await Massageshop.deleteOne({ _id: req.params.id })
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};
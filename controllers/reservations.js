const Reservation = require('../models/Reservation');
const Massageshop = require('../models/Massageshop');

// @desc     Get all reservations
// @route    GET /api/v1/reservations
// @access   Public
exports.getReservations = async (req, res, next) => {
    let query;

    if (req.user.role !== 'admin') {
        query = Reservation.find({ user: req.user.id }).populate({
            path: 'massage_shop',
            select: 'name telephone'
        });
    } else {
        if (req.params.massageshopId) {
            query = Reservation.find({ massage_shop: req.params.massageshopId }).populate({
                path: 'massage_shop',
                select: 'name telephone'
            });
        } else {
            query = Reservation.find().populate({
                path: 'massage_shop',
                select: 'name telephone'
            });
        }
    }

    try {
        const reservations = await query;

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Cannot find reservations" });
    }
};

// @desc     Get single reservation
// @route    GET /api/v1/reservations/:id
// @access   Public
exports.getReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'massage_shop',
            select: 'name address telephone'
        });

        if (!reservation) {
            return res.status(404).json({ success: false, message: `No reservation with ID ${req.params.id}` });
        }

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Cannot find reservation" });
    }
};

// @desc     Add reservation
// @route    POST /api/v1/massageshops/:massageshopId/reservations
// @access   Private
exports.addReservation = async (req, res, next) => {
    try {
        req.body.massage_shop = req.params.massageshopId;

        const massageshop = await Massageshop.findById(req.params.massageshopId);
        if (!massageshop) {
            return res.status(404).json({
                success: false,
                message: `No massageshop with ID ${req.params.massageshopId}`
            });
        }

        req.body.user = req.user.id;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const existingReservations = await Reservation.find({
            user: req.user.id,
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });

        if (existingReservations.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `User ${req.user.id} already has 3 reservations today`
            });
        }

        const reservation = await Reservation.create(req.body);

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Cannot create reservation" });
    }
};

// @desc     Update reservation
// @route    PUT /api/v1/reservations/:id
// @access   Private
exports.updateReservation = async (req, res, next) => {
    try {
        let reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation with ID ${req.params.id}`
            });
        }

        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this reservation`
            });
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Cannot update reservation" });
    }
};

// @desc     Delete reservation
// @route    DELETE /api/v1/reservations/:id
// @access   Private
exports.deleteReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation with ID ${req.params.id}`
            });
        }

        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this reservation`
            });
        }

        await reservation.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Cannot delete reservation" });
    }
};

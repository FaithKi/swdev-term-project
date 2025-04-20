const express = require('express');
const { getMassageshops, getMassageshop, createMassageshop, updateMassageshop, deleteMassageshop } = require('../controllers/massageshops');
const { protect, authorize } = require('../middleware/auth');
const { getMassageShopCoordinate } = require('../services/googlemap')

const reservationRouter = require('./reservations');

const router = express.Router();

router.use('/:massageshopId/reservations', reservationRouter);

router.route('/:id/coord').get(getMassageShopCoordinate);

router.route('/').get(getMassageshops).post(protect, authorize('admin'), createMassageshop);

router.route('/:id').get(getMassageshop).put(protect, authorize('admin'), updateMassageshop).delete(protect, authorize('admin'), deleteMassageshop);

module.exports = router;
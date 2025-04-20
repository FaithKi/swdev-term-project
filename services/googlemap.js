const Massageshop = require('../models/Massageshop')

const getMassageShopCoordinate = async (req, res) => {
    try {
        const { id } = req.params

        if(!id) return res.staus(400).json({success:false, message:"Bad request"})
    
        const shop = await Massageshop.findById(id)
    
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${shop.address}&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`)
        const data = await response.json()
        const coordinates = data.results[0].navigation_points[0].location
    
        res.status(200).json({success:true, coordinates})
    } catch(error) {
        res.status(500).json({success:false, error})
    }

}

module.exports = { getMassageShopCoordinate }
const User = require('../models/User');

// @desc     Level up the user if enough points
// @route    POST /api/v1/users/level-up
// @access   Private
exports.levelUp = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.current_point < user.pointsToNextLevel) {
            return res.status(400).json({
                success: false,
                message: `You need ${user.pointsToNextLevel} points to level up. You currently have ${user.current_point}.`
            });
        }

        user.current_point -= user.pointsToNextLevel;
        user.level += 1;
        user.pointsToNextLevel = Math.floor(user.pointsToNextLevel * 1.5);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Level up successful!",
            data: {
                level: user.level,
                current_point: user.current_point,
                pointsToNextLevel: user.pointsToNextLevel
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Level up failed" });
    }
};

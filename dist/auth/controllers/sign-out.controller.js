"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignOutController = void 0;
const sign_out_service_1 = require("../../auth/services/sign-out.service");
const cookie_utils_1 = require("../../common/utils/cookie.utils");
const SignOutController = async (req, res, next) => {
    try {
        const extractedUser = req.user;
        if (!extractedUser) {
            res.clearCookie("refreshToken", cookie_utils_1.optionsRevokedCookie);
            return res.status(200).json({ success: true });
        }
        const service = new sign_out_service_1.SignOutService();
        await service.execute(extractedUser);
        res.clearCookie("refreshToken", cookie_utils_1.optionsRevokedCookie);
        return res.status(200).json({
            success: true,
            message: "ĐĂNG XUẤT THÀNH CÔNG",
        });
    }
    catch (err) {
        next(err);
    }
};
exports.SignOutController = SignOutController;

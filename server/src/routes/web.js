import express from "express";
import {
    createHousehold,
    getAllHouseholds,
    getHouseholdById,
    updateHousehold,
    deleteHousehold,
    addPersonToHousehold,
    splitHousehold,
    getHouseholdHistory,
    changeHouseholdHead,
} from "../controllers/householdController.js";
import {
    getAllNhanKhau,
    getNhanKhauById,
    updateNhanKhau,
    getPersonEvents,
    handlePersonEvent,
} from "../controllers/personController.js";
// --- AUTH CONTROLLER --- 
import authController from "../controllers/authController.js";
// --- USER CONTROLLER ---
import userController from "../controllers/userController.js";
// --- CHECK TOKEN ---
import verifyToken from "../middleware/authMiddleware.js";
// --- CHECK ROLE ---
import checkRole from "../middleware/roleMiddleware.js";

import pool from "../config/db.js";

const router = express.Router();
let initWebRoutes = (app) => {

    // ---- AUTH ROUTE ---- (Admin)
    // POST: Tạo 1 tài khoản Admin mới (Cái này cực kỳ nguy hiểm => Tạo ra để Group test => Cần xóa đi khi hoàn thiện project)
    router.post("/api/v1/auth/register", authController.handleRegister);
    // POST: Login cho tất cả các User
    router.post("/api/v1/auth/login", authController.handleLogin);
    // GET: Lấy thông tin của cá nhân User đã đăng nhập
    router.get("/api/v1/auth/me", verifyToken, authController.getMe);
    
    // ---- USER ROUTE ---- (Admin)
    // GET: Admin lấy danh sách tất cả các Users
    router.get("/api/v1/get-all-users", verifyToken, checkRole(['admin']), userController.handleGetAllUsers);
    // POST: Admin tạo User mới cho cấp dưới
    router.post("/api/v1/create-user", verifyToken, checkRole(['admin']), userController.handleCreateUser);
    // PUT: Admin sửa User (Reset pass, đổi quyền...)
    router.put("/api/v1/update-user/:id", verifyToken, checkRole(['admin']), userController.handleUpdateUser);
    // DELETE: Admin xóa user
    router.delete("/api/v1/delete-user/:id", verifyToken, checkRole(['admin']), userController.handleDeleteUser);
    
    // ---- Update & Logout ---
    // PUT: Cá nhân User update (full_name || password) => Không khuyến khích, nên để Admin quản lý tất cả
    router.put("/api/v1/auth/updateProfile", verifyToken, authController.handleUpdateProfile);
    // POST: Logout cho tất cả Users
    router.post("/api/v1/auth/logout", verifyToken, authController.handleLogout);

    router.post("/api/v1/ho-khau", createHousehold);
    router.get("/api/v1/ho-khau/:id", getHouseholdById);
    router.post("/api/v1/ho-khau/:hoKhauId/nhan-khau", addPersonToHousehold);
    router.get("/api/v1/ho-khau", getAllHouseholds);
    router.put("/api/v1/ho-khau/:id", updateHousehold);
    router.delete("/api/v1/ho-khau/:id", deleteHousehold);
    router.get("/api/v1/ho-khau/:id/lich-su", getHouseholdHistory);
    router.put(
        "/api/v1/ho-khau/:hoKhauId/thay-doi-chu-ho",
        changeHouseholdHead
    );

    router.get("/api/v1/nhan-khau/:id", getNhanKhauById);
    router.get("/api/v1/nhan-khau", getAllNhanKhau);
    router.put("/api/v1/nhan-khau/:id", updateNhanKhau);
    router.post("/api/v1/ho-khau/tach-khau", splitHousehold);
    router.get("/api/v1/nhan-khau/:id/lich-su", getPersonEvents);
    router.put("/api/v1/nhan-khau/:nhanKhauId/bien-dong", handlePersonEvent);
    return app.use("/", router);
};

export default initWebRoutes;

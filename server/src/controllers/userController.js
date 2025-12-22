import userService from "../services/userService.js";

// GET: Lấy danh sách
const handleGetAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách tài khoản thành công",
            data: users,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi server " + error.message,
        });
    }
};

// POST: Tạo mới
const handleCreateUser = async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body);
        return res.status(201).json({
            success: true,
            message: "Tạo tài khoản mới thành công",
            data: newUser,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// PUT: Cập nhật
const handleUpdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateUser = await userService.updateUser(id, req.body);

        return res.status(200).json({
            success: true,
            message: "Cập nhật tài khoản thành công",
            data: updateUser,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// DELETE: Xóa
const handleDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentAdminId = req.user.user_id;

        await userService.deleteUser(currentAdminId, id);

        return res.status(200).json({
            success: true,
            message: "Xóa tài khoản thành công",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export default {
    handleGetAllUsers,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
};
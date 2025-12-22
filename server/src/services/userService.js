import db from "../models/index.js";
import bcrypt from "bcryptjs";

const User = db.User;

// 1. Lấy danh sách tất cả User
const getAllUsers = async () => {
    // Lấy tất cả trừ trường password
    const users = await User.findAll({
        attributes: { exclude: ["password"] },
        order: [["createdAt", "DESC"]], // Người mới tạo hiện lên đầu
    });
    return users;
};

// 2. Tạo User mới (Admin tạo cho cấp dưới)
const createUser = async (data) => {
    // Check trùng username
    const existingUser = await User.findOne({ where: {username: data.username } });
    if(existingUser) {
        throw new Error("Tên đăng nhập đã tồn tại");
    }

    // Tạo user (Model tự động hash password nhờ hook)
    const newUser = await User.create({
        username: data.username,
        password: data.password,
        full_name: data.full_name,
        role: data.role || "accountant",
    });

    // Trả về info (bỏ qua password)
    const { password: _, ...userInfo } = newUser.toJSON();
    return userInfo;
};

// 3. Cập nhật User (Đổi role, Reset mật khẩu...)
const updateUser = async (userId, updateData) => {
    const user = await User.findByPk(userId);
    if(!user) {
        throw new Error("Người dùng không tồn tại");
    }

    // update
    await user.update(updateData);

    // Trả về info mới
    const { password: _, ...userInfo} = user.toJSON();
    return userInfo;
};

// 4. Xóa User
const deleteUser = async (adminId, targetUserId) => {
    // Chặn: không cho Admin tự xóa chính mình
    if(String(adminId) === String(targetUserId)) {
        throw new Error("Bạn không thể tự xóa tài khoản của chính mình!");
    }

    const user = await User.findByPk(targetUserId);
    if(!user) {
        throw new Error("Người dùng không tồn tại!");
    }

    await user.destroy(); // Xóa khỏi DB
    return true;
};

export default {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
};
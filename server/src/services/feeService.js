import db from "../models/index.js";

const FeeRate = db.FeeRate;
const Payment = db.Payment;
const Household = db.Household;
const Person = db.Person;

// 1. Tạo đợt thu phí mới (VD: Phí vệ sinh 2025)
const createFeeWave = async (data) => {
  // Dùng transaction để đảm bảo tính toàn vẹn dữ liệu
  // Nếu tạo payment lỗi thì rollback luôn việc tạo FeeRate
  const t = await db.sequelize.transaction();

  try {
    console.log("--- BẮT ĐẦU TẠO ĐỢT THU ---");
    // A. Tạo bản ghi FeeRate (Đợt thu)
    const newFee = await FeeRate.create(
      {
        item_type: data.item_type, // "Phí vệ sinh 2025"
        unit_type: data.unit_type, // "per_person"
        amount: data.amount, // 6000
        effective_from: data.effective_from,
        effective_to: data.effective_to,
        note: data.note,
      },
      { transaction: t }
    );

    console.log("1. Đã tạo FeeRate ID:", newFee.rate_id);

    // B. Lấy danh sách tất cả các hộ khẩu đang hoạt động
    // Include Person để đếm số nhân khẩu
    const allHouseholds = await Household.findAll({
      include: [
        {
          model: Person,
          as: "residents",
          // Chỉ đếm những người đang thường trú/tạm trú (tuỳ nghiệp vụ, ở đây mình đếm hết)
          attributes: ["person_id"],
        },
      ],
    });

    if (allHouseholds.length === 0) {
      console.log(
        "CẢNH BÁO: Không tìm thấy hộ khẩu nào trong DB! Hãy kiểm tra lại bảng 'core.household'"
      );
    }

    // C. Chuẩn bị dữ liệu Payment cho từng hộ
    const paymentRecords = allHouseholds.map((household) => {
      let totalAmount = 0;
      const memberCount = household.residents.length;

      // Logic tính tiền
      if (newFee.unit_type === "per_person") {
        // Công thức: 6000 * 12 tháng * số người
        // Ở đây giả sử amount nhập vào là 6000 (đơn giá tháng)
        // Hoặc nếu amount là trọn gói năm thì bỏ * 12 đi.
        // Theo mô tả: 6.000 / 1 tháng / 1 người => Phải nhân 12
        totalAmount = parseFloat(newFee.amount) * 12 * memberCount;
      } else {
        // Tính theo hộ
        totalAmount = parseFloat(newFee.amount);
      }

      return {
        household_id: household.household_id,
        rate_id: newFee.rate_id,
        year: new Date(newFee.effective_from).getFullYear(),
        payment_status: "pending",
        total_amount: totalAmount,
        date: new Date(),
        note: `Thu phí vệ sinh cho ${memberCount} nhân khẩu của hộ gia đình`,
      };
    });

    // D. Insert vào bảng Payment
    if (paymentRecords.length > 0) {
      await Payment.bulkCreate(paymentRecords, { transaction: t });
    }

    // Commit transaction (Lưu vào DB)
    await t.commit();

    return newFee;
  } catch (error) {
    console.error("LỖI TRONG TRANSACTION:", error);
    // Nếu có lỗi, hoàn tác tất cả
    await t.rollback();
    throw error;
  }
};

// 2. Lấy danh sách các khoản thu
const getAllFeeWaves = async () => {
  return await FeeRate.findAll({
    order: [["effective_from", "DESC"]],
  });
};

// 3. Xóa bản ghi
const deleteFeeWave = async (rateId) => {
  // Khởi tạo Transaction
  const t = await db.sequelize.transaction();
  try {
    // 1. Tìm đợt thu xem có tồn tại không
    const feeRate = await FeeRate.findByPk(rateId);
    if (!feeRate) {
      throw new Error("Khoản thu không tồn tại!");
    }

    // 2. CẢNH BÁO (Optional): Kiểm tra xem có ai đóng tiền chưa?
    // Nếu muốn chặt chẽ, bạn có thể chặn xóa nếu đã có người nộp tiền.
    // Ở đây mình bỏ qua để bạn dễ dàng dọn rác test.

    // 3. Xóa tất cả các phiếu thu (Payment) liên quan trước
    // (Do DB cấu hình SET NULL nên ta phải xóa tay bước này)
    await Payment.destroy({
      where: { rate_id: rateId },
      transaction: t,
    });

    // 4. Xóa đợt thu (FeeRate)
    await feeRate.destroy({ transaction: t });

    // 5. Xác nhận thành công
    await t.commit();
    return true;
  } catch (error) {
    // Nếu có lỗi, hoàn tác (không xóa gì cả)
    await t.rollback();
    throw error;
  }
};

export default {
  createFeeWave,
  getAllFeeWaves,
  deleteFeeWave
};

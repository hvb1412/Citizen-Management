import statisticService from "../services/statisticService.js";

const getDashboard = async (req, res) => {
  try {
    const data = await statisticService.getDashboardStats();

    return res.status(200).json({
      success: true,
      message: "Lấy số liệu thống kê Dashboard thành công",
      data: data,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi Server khi lấy thống kê: " + error.message,
    });
  }
};

const getFeeReport = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id) {
            return res.status(400).json({
                success: false,
                messsage: "Thiếu ID khoản thu"
            });
        }

        const data = await statisticService.getFeeCollectionReport(id);

        return res.status(200).json({
            success: true,
            message: "Lấy báo cáo thu phí thành công",
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi báo cáo: " + error.message
        });
    }
};

export default {
  getDashboard,
  getFeeReport
};

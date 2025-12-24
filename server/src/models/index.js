import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import process from "process";
import "dotenv/config";

// Import file config.js mới tạo
import allConfigs from "../config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const basename = path.basename(__filename);

// Xác định môi trường (mặc định là development)
const env = process.env.NODE_ENV || "development";

// Lấy cấu hình tương ứng với môi trường
const config = allConfigs[env];

const db = {};

let sequelize;

console.log(`🔄 Đang kết nối Database ở chế độ: ${env}`);

if (config.use_env_variable) {
  // Trường hợp dùng connection string (thường cho Production trên Heroku/Railway)
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Trường hợp dùng từng biến lẻ (Development hoặc Production thông thường)
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Kiểm tra kết nối (Optional - giúp debug dễ hơn)
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Kết nối Database thành công.");
  })
  .catch((err) => {
    console.error("❌ Không thể kết nối Database:", err);
  });

// Đọc các file models
const files = fs.readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.slice(-3) === ".js" &&
    file.indexOf(".test.js") === -1
  );
});

// Import models động
for (const file of files) {
  const filePath = path.join(__dirname, file);
  const fileUrl = `file:///${filePath.replace(/\\/g, "/")}`;
  const modelModule = await import(fileUrl);
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// Thiết lập associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
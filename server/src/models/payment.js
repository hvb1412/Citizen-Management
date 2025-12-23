"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      // Payment thuộc về 1 hộ khẩu
      Payment.belongsTo(models.Household, {
        foreignKey: "household_id",
        as: "household",
      });
      // Payment thuộc về 1 đợt thu phí
      Payment.belongsTo(models.FeeRate, {
        foreignKey: "rate_id",
        as: "feeRate",
      });
    }
  }

  Payment.init(
    {
      payment_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      household_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      rate_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payer_name: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      payment_method: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "partial", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      total_amount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
      },
      paid_amount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payment",
      schema: "finance",
      timestamps: false,
    }
  );

  return Payment;
};

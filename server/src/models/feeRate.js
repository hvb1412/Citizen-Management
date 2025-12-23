"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
    class FeeRate extends Model {
        static associate(models) {
            // Một đợt thu phí có nhiều khoản thanh toán (của nhiều hộ)
            FeeRate.hasMany(models.Payment, {
                foreignKey: "rate_id",
                as: "payments",
            });
        }
    }

    FeeRate.init(
        {
            rate_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            item_type: {
                type: DataTypes.STRING(80),
                allowNull: false,
            },
            unit_type: {
                type: DataTypes.ENUM("per_person", "per_household"),
                allowNull: false,
            },
            amount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
            },
            effective_from: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            effective_to: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            note: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "FeeRate",
            tableName: "fee_rate",
            schema: "finance",
            timestamps: false,
        }
    );

    return FeeRate;

};
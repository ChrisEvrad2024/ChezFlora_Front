"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const user_model_1 = require("../database/models/user.model");
const sequelize_1 = require("sequelize");
class UserRepository {
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.findByPk(id);
            return user ? user.toJSON() : null;
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.findOne({ where: { email } });
            return user ? user.toJSON() : null;
        });
    }
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield user_model_1.User.findAll(options);
            return users.map(user => user.toJSON());
        });
    }
    create(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.create(userData);
            return user.toJSON();
        });
    }
    update(id, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.findByPk(id);
            if (!user) {
                return null;
            }
            yield user.update(userData);
            return user.toJSON();
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield user_model_1.User.destroy({ where: { id } });
            return result > 0;
        });
    }
    findByResetToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.findOne({
                where: {
                    resetPasswordToken: token,
                    resetPasswordExpires: { [sequelize_1.Op.gt]: new Date() }
                }
            });
            return user ? user.toJSON() : null;
        });
    }
}
exports.UserRepository = UserRepository;

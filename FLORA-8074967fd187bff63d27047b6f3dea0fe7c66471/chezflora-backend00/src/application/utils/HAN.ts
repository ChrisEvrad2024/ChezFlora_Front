import { AppError } from "../../infrastructure/http/middlewares/error.middleware";

function handleError(error: unknown, message: string): never {
    if (error instanceof Error) {
        throw new AppError(`${message}: ${error.message}`, 500);
    }
    throw new AppError(`${message}: ${String(error)}`, 500);
}
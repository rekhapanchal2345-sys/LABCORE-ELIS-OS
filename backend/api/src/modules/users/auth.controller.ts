import { Request, Response, NextFunction } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserStatus,
  deleteUser,
} from "./user.service";
import { successResponse, createdResponse } from "../../utils/response";

export const listUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await getUsers();

    return successResponse(
      res,
      users,
      "Users fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getUserById(req.params.id as string);

    return successResponse(
      res,
      user,
      "User fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await createUser(req.body);

    return createdResponse(
      res,
      user,
      "User created successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await updateUser(
      req.params.id as string,
      req.body
    );

    return successResponse(
      res,
      user,
      "User updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await changeUserStatus(
      req.params.id as string,
      req.body.status
    );

    return successResponse(
      res,
      user,
      "User status updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await deleteUser(req.params.id as string);

    return successResponse(
      res,
      result,
      "User deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};
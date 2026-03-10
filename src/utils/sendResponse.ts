import { Response } from 'express';

type TMeta = {
  page: number;
  limit: number;
  total: number;
};

type TResponse<T> = {
  success: boolean;
  message: string;
  meta?: TMeta;
  data: T;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(200).json({
    success: true,
    message: data.message,
    meta: data.meta,
    data: data.data,
  });
};

export default sendResponse;

import { Prisma } from '../generated/prisma/client';

type TErrorSources = {
  path: string | number;
  message: string;
}[];

type TGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorSources: TErrorSources;
};

const handlePrismaValidationError = (
  err: Prisma.PrismaClientValidationError,
): TGenericErrorResponse => {
  // Extracting the specific error message from the verbose Prisma error string
  const extractedMessage =
    err.message.split('\n').pop()?.trim() || 'Validation Error';

  const errorSources: TErrorSources = [
    {
      path: '',
      message: extractedMessage,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  };
};

export default handlePrismaValidationError;

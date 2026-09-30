export class HttpError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode = 400, code?: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

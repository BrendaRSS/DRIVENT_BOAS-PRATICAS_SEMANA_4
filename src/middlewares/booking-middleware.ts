import httpStatus from "http-status";
import { bookingSchema } from "@/schemas";
import { NextFunction, Request, Response } from "express";

export async function validaBooking(req: Request, res: Response, next: NextFunction) {
  const body = req.body;
  const { error } = bookingSchema.validate(body, { abortEarly: false });

  if(error) {
    const errors = error.details.map((d) => d.message);
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).send(errors);
  }

  res.locals.body = body;
  next();
}

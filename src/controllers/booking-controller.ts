import { AuthenticatedRequest } from "@/middlewares";
import { Request, Response } from "express";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
 
  try{
    const booking = await bookingService.getBooking(Number(userId));
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if(error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    } 
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = res.locals.body;
 
  try{
    const roomIdChose = await bookingService.postBooking(Number(userId), Number(roomId));
    return res.status(httpStatus.CREATED).send({ roomId });
  } catch (error) {
    // if(error.name === "NotFoundError") {
    //   return res.sendStatus(httpStatus.NOT_FOUND);
    // } 
    if(error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    } 
    if(error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if(error.name === "crowded room") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    if(error.name === "room not exist") {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function putBookingId(req: Request, res: Response) {
  return res.status(httpStatus.OK).send("PUT BOOKING");
}

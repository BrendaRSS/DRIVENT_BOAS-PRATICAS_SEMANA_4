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
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = res.locals.body;
 
  try{
    const bookingId = await bookingService.postBooking(Number(userId), Number(roomId));
    return res.status(httpStatus.OK).send({ bookingId });
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
  }
}

export async function putBookingId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { bookingId } = req.params;
  const { roomId } = res.locals.body;
  
  try{
    const bookingIdPut = await bookingService.putBooking(Number(userId), Number(roomId), Number(bookingId));
    return res.status(httpStatus.OK).send({ bookingId: bookingIdPut });
  } catch (error) {
    if(error.name === "crowded room") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    if(error.name === "room not exist") {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
  }
}

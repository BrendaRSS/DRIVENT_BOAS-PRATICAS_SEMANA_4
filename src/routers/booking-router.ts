import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getBooking, postBooking, putBookingId } from "@/controllers";
import { validaBooking } from "@/middlewares";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getBooking)
  .post("/", validaBooking, postBooking)
  .put("/:bookingId", validaBooking, putBookingId);

export { bookingRouter };

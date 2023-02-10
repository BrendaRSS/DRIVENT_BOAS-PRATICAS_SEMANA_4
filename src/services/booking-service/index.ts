import { notFoundError, unauthorizedError, forbiddemBooking, roomNotExist } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getBooking(id: number) {
  const booking = await bookingRepository.getBooking(id);

  if(!booking) {
    throw notFoundError();
  }

  return booking;
}

async function postBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if(!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if(!ticket) {
    throw notFoundError();
  }

  if(ticket.status !== "PAID") {
    throw unauthorizedError();
  }

  if(ticket.TicketType.isRemote || ticket.TicketType.includesHotel ===  false) {
    throw unauthorizedError();
  }

  const roomIdExist = await bookingRepository.getRoomId(roomId);
  if(!roomIdExist) {
    throw roomNotExist();
  }

  const crowdedRooms = await bookingRepository.getAllRoomBooking(roomId);
  if(crowdedRooms.length >= roomIdExist.capacity) {
    throw forbiddemBooking();
  }

  const booking = await bookingRepository.postBooking(userId, roomId);

  return booking.id;
}

async function putBooking(userId: number, roomId: number, bookingId: number) {
  const roomIdExist = await bookingRepository.getRoomId(roomId);
  if(!roomIdExist) {
    throw roomNotExist();
  }

  const crowdedRooms = await bookingRepository.getAllRoomBooking(roomId);
  if(crowdedRooms.length >= roomIdExist.capacity) {
    throw forbiddemBooking();
  }

  const bookingIdExist = await bookingRepository.getBookingAll(bookingId);
  if(!bookingIdExist) {
    throw forbiddemBooking();
  }

  if(bookingIdExist.userId !== userId) {
    throw forbiddemBooking();
  }

  const booking = await bookingRepository.putBooking(bookingId, roomId);

  return booking.id;
}

const bookingService = {
  getBooking,
  postBooking,
  putBooking
};
  
export default bookingService;

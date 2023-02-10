import { prisma } from "@/config";

export async function getBooking(id: number) {
  return prisma.booking.findFirst({
    where: {
      userId: id
    },
    select: {
      id: true,
      Room: true
    }
  });
}

export async function getBookingAll(id: number) {
  return prisma.booking.findFirst({
    where: {
      id: id,
    }
  });
}

export async function getRoomId(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    }
  });
}

export async function getAllRoomBooking(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId: roomId
    }
  });
}

export async function postBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId: userId,
      roomId: roomId,
    }
  });
}

export async function putBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId: roomId
    },
  });
}

const bookingRepository = {
  getBooking,
  postBooking,
  getRoomId,
  getAllRoomBooking,
  getBookingAll,
  putBooking
};
  
export default bookingRepository;

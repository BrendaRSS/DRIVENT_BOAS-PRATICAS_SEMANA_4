import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import { createEnrollmentWithAddress, createUser, createTicketTypeWithHotel, createTicket, createHotel, createRoomWithHotelId, createBooking, createTicketTypeRemote, createTicketTypeWithoutHotel, createRoomWithHotelIdCapacityOne } from "../factories";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
  await init();
});
    
beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  describe("when token is valid", () => {
    it("should respond with status 404 when user doesn't have a booking", async () => {
      const token = await generateValidToken();
    
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 200 and user booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotels = await createHotel();
      const rooms = await createRoomWithHotelId(hotels.id);
      const booking = await createBooking(user.id, rooms.id);
    
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        "id": booking.id,
        "Room": {
          id: rooms.id,
          name: rooms.name,
          capacity: rooms.capacity,
          hotelId: hotels.id,
          createdAt: rooms.createdAt.toISOString(),
          updatedAt: rooms.updatedAt.toISOString()
        }
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 422 when body is invalid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
    
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send();
    
      expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
    });

    it("should respond with status 404 when user doesn't have an enrollment yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotels = await createHotel();
      const rooms = await createRoomWithHotelId(hotels.id);
      const body = { roomId: rooms.id };
    
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
    
      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 404 when user doesnt have a ticket yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const hotels = await createHotel();
      const rooms = await createRoomWithHotelId(hotels.id);
      const body = { roomId: rooms.id };
    
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
    
      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 402 when user has not paid the ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const hotels = await createHotel();
      const rooms = await createRoomWithHotelId(hotels.id);
      const body = { roomId: rooms.id };
    
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
    
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 when ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotels = await createHotel();
      const rooms = await createRoomWithHotelId(hotels.id);
      const body = { roomId: rooms.id };
    
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
    
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 when ticket does not include hosting", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotels = await createHotel();
      const rooms = await createRoomWithHotelId(hotels.id);
      const body = { roomId: rooms.id };
    
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
    
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 404 when room not exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotels = await createHotel();
      const body = { roomId: 1 };
    
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
    
      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 403 when is crowded room", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotels = await createHotel();
      const rooms = await createRoomWithHotelIdCapacityOne(hotels.id);
      const body = { roomId: rooms.id };
      await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
    
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 and chosen id room", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotels = await createHotel();
      const rooms = await createRoomWithHotelId(hotels.id);
      const body = { roomId: rooms.id };
    
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
    
      expect(response.status).toBe(httpStatus.CREATED);
      expect(response.body).toEqual({
        roomId: rooms.id
      });
    });
  });
});

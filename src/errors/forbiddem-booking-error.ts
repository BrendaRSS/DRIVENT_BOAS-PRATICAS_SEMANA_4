import { ApplicationError } from "@/protocols";

export function forbiddemBooking(): ApplicationError {
  return {
    name: "crowded room",
    message: "No result for this search!",
  };
}

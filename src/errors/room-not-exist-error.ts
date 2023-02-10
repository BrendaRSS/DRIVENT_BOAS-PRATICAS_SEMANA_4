import { ApplicationError } from "@/protocols";

export function roomNotExist(): ApplicationError {
  return {
    name: "room not exist",
    message: "No result for this search!",
  };
}

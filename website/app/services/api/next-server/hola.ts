"use server";
import { RequestSSR } from "../../apiClient";

export async function getServerHola() {
  return RequestSSR<any>({ url: "hola/", method: "GET", tags: ["hola"] });
}

// src/services/role-coach/client.ts

import { api } from "@/utils/apiServices";

import type {
  CoachClient,
  CoachClientDetails,
  CoachClientsResponse,
  CoachClientResponse,
} from "@/types/role-coach/client";

const BASE_URL = "/api/role-coach/clients";

const unwrap = <T>(response: any): T => {
  return response?.success ? response : response?.data;
};

/* -------------------------------------------------------------------------- */
/* GET ALL CLIENTS                                                            */
/* -------------------------------------------------------------------------- */

export const getCoachClients = async (): Promise<CoachClient[]> => {
  const response = await api.get(BASE_URL);

  const result = unwrap<CoachClientsResponse>(response);

  return result?.data || [];
};

/* -------------------------------------------------------------------------- */
/* GET CLIENT BY ID                                                           */
/* -------------------------------------------------------------------------- */

export const getCoachClientById = async (
  clientId: string
): Promise<CoachClientDetails> => {
  if (!clientId) {
    throw new Error("Client ID is required");
  }

  const response = await api.get(
    `${BASE_URL}/${clientId}`
  );

  const result = unwrap<CoachClientResponse>(response);

  return result.data;
};
import "server-only";

import Exa from "exa-js";

export const exaConfigured = process.env.EXA_API_KEY !== undefined;

export const exa = exaConfigured ? new Exa(process.env.EXA_API_KEY) : null;

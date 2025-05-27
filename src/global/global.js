import { PinataSDK } from "pinata-web3";

export const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API;

export const pinata = new PinataSDK({
    pinataJwt: `${import.meta.env.VITE_PINATA_JWT}`,
    pinataGateway: `${import.meta.env.VITE_GATEWAY_URL}`,
});
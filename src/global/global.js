import { PinataSDK } from "pinata-web3";

export const BACKEND_API_URL = 'http://localhost:4444/api/';

export const pinata = new PinataSDK({
    pinataJwt: `${import.meta.env.VITE_PINATA_JWT}`,
    pinataGateway: `${import.meta.env.VITE_GATEWAY_URL}`,
});
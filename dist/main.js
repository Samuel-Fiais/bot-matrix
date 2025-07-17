"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const matrix_bot_sdk_1 = require("matrix-bot-sdk");
const CONFIG = {
    homeserverUrl: "https://matrix.org",
    accessToken: "mct_uAN7od0EsTGO0oWy5CsBjGLPXABtrU_XbtEh2",
    webhookUrl: "https://n8n-fiais-e5h6dyecakhvc4fz.brazilsouth-01.azurewebsites.net/webhook-test/5947c1ee-b200-4159-b205-3a10eeeecd7c",
    storagePath: "bot.json",
};
function sendToWebhook(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Enviando para o webhook:`, payload);
            yield axios_1.default.post(CONFIG.webhookUrl, payload);
            console.log("Webhook enviado com sucesso!");
        }
        catch (error) {
            let errorMessage = "Um erro desconhecido ocorreu.";
            if (axios_1.default.isAxiosError(error)) {
                errorMessage = error.response
                    ? JSON.stringify(error.response.data)
                    : error.message;
            }
            else if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error(`Erro ao enviar webhook: ${errorMessage}`);
        }
    });
}
function startBot() {
    return __awaiter(this, void 0, void 0, function* () {
        const storage = new matrix_bot_sdk_1.SimpleFsStorageProvider(CONFIG.storagePath);
        const client = new matrix_bot_sdk_1.MatrixClient(CONFIG.homeserverUrl, CONFIG.accessToken, storage);
        matrix_bot_sdk_1.AutojoinRoomsMixin.setupOnClient(client);
        try {
            const botUserId = yield client.getUserId();
            console.log(`Bot autenticado com sucesso como: ${botUserId}`);
            client.on("room.message", (roomId, event) => __awaiter(this, void 0, void 0, function* () {
                console.log(`Mensagem recebida no quarto ${roomId} de ${event.sender}: ${event.content.body}`);
                const messagePayload = {
                    message: event.content.body,
                    sender: event.sender,
                    roomId: roomId,
                    eventId: event.event_id,
                };
                yield sendToWebhook(messagePayload);
            }));
            yield client.start();
            console.log("Bot iniciado e aguardando mensagens...");
        }
        catch (error) {
            let errorMessage = "Erro fatal ao iniciar o bot.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            console.error(errorMessage);
            console.error("Verifique se o token de acesso e o homeserverUrl estão corretos.");
            process.exit(1);
        }
    });
}
startBot();

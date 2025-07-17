import axios from "axios";
import {
  AutojoinRoomsMixin,
  MatrixClient,
  SimpleFsStorageProvider,
} from "matrix-bot-sdk";

interface AppConfig {
  homeserverUrl: string;
  accessToken: string;
  webhookUrl: string;
  storagePath: string;
}

interface WebhookPayload {
  message: string;
  sender: string;
  roomId: string;
  eventId: string;
}

const CONFIG: AppConfig = {
  homeserverUrl: "https://matrix.org",
  accessToken: "mct_uAN7od0EsTGO0oWy5CsBjGLPXABtrU_XbtEh2",
  webhookUrl:
    "https://n8n-fiais-e5h6dyecakhvc4fz.brazilsouth-01.azurewebsites.net/webhook/0b101cae-38c7-440c-a12f-c15cfbcf249c",
  storagePath: "bot.json",
};

async function sendToWebhook(payload: WebhookPayload): Promise<void> {
  try {
    console.log(`Enviando para o webhook:`, payload);
    await axios.post(CONFIG.webhookUrl, payload);
    console.log("Webhook enviado com sucesso!");
  } catch (error: unknown) {
    let errorMessage = "Um erro desconhecido ocorreu.";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response
        ? JSON.stringify(error.response.data)
        : error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(`Erro ao enviar webhook: ${errorMessage}`);
  }
}

async function startBot(): Promise<void> {
  const storage = new SimpleFsStorageProvider(CONFIG.storagePath);
  const client = new MatrixClient(
    CONFIG.homeserverUrl,
    CONFIG.accessToken,
    storage
  );

  AutojoinRoomsMixin.setupOnClient(client);

  try {
    const botUserId: string = await client.getUserId();
    console.log(`Bot autenticado com sucesso como: ${botUserId}`);

    client.on("room.message", async (roomId: string, event: any) => {
      console.log(
        `Mensagem recebida no quarto ${roomId} de ${event.sender}: ${event.content.body}`
      );
      const messagePayload: WebhookPayload = {
        message: event.content.body,
        sender: event.sender,
        roomId: roomId,
        eventId: event.event_id,
      };

      await sendToWebhook(messagePayload);
    });

    await client.start();
    console.log("Bot iniciado e aguardando mensagens...");
  } catch (error: unknown) {
    let errorMessage = "Erro fatal ao iniciar o bot.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(errorMessage);
    console.error(
      "Verifique se o token de acesso e o homeserverUrl estão corretos."
    );
    process.exit(1);
  }
}

startBot();

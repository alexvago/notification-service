import { DynamicModule, Module, Provider } from "@nestjs/common";
import { EmailSender } from "./email.sender.js";
import { NotificationSender } from "./notification-sender.js";
import { PushSender } from "./push.sender.js";
import { SmsSender } from "./sms.sender.js";

export const NOTIFICATION_SENDERS = "NOTIFICATION_SENDERS";
export const SIMULATED_LATENCY_MS = "SIMULATED_LATENCY_MS";

export type NotificationSenders = Map<
  NotificationSender["channel"],
  NotificationSender
>;

function createSendersMap(
  emailSender: EmailSender,
  smsSender: SmsSender,
  pushSender: PushSender,
): NotificationSenders {
  return new Map<NotificationSender["channel"], NotificationSender>([
    [emailSender.channel, emailSender],
    [smsSender.channel, smsSender],
    [pushSender.channel, pushSender],
  ]);
}

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: DynamicModule is a NestJS pattern that requires a static method to register the module with dynamic providers.
export class SendersModule {
  static register(simulatedLatencyMs: number = 5000): DynamicModule {
    const sendersProvider: Provider = {
      provide: NOTIFICATION_SENDERS,
      useFactory: (
        emailSender: EmailSender,
        smsSender: SmsSender,
        pushSender: PushSender,
      ) => {
        return createSendersMap(emailSender, smsSender, pushSender);
      },
      inject: [EmailSender, SmsSender, PushSender],
    };

    return {
      module: SendersModule,
      providers: [
        sendersProvider,
        {
          provide: EmailSender,
          useFactory: () => new EmailSender(simulatedLatencyMs),
        },
        {
          provide: SmsSender,
          useFactory: () => new SmsSender(simulatedLatencyMs),
        },
        {
          provide: PushSender,
          useFactory: () => new PushSender(simulatedLatencyMs),
        },
      ],
      exports: [NOTIFICATION_SENDERS, EmailSender, SmsSender, PushSender],
    };
  }
}

import { OpenAPIValidatorModule } from "@nest-openapi/validator";
import { Module } from "@nestjs/common";
import addFormats from "ajv-formats";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { NotificationsModule } from "./notifications/notifications.module.js";
import openApiSpec from "./openapi.json" with { type: "json" };

@Module({
  imports: [
    OpenAPIValidatorModule.forRoot({
      specSource: { type: "object", spec: openApiSpec },

      ajv: {
        options: {
          strict: false,
          removeAdditional: true,
        },
        configure: (ajv: any) => {
          addFormats.default(ajv);
        },
      },
    }),
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

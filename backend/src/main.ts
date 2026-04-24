import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
// import { patchNestJsSwagger } from "nestjs-zod";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>("PORT") || 3000;
  const frontendUrl = configService.get<string>("FRONTEND_URL");

  app.useGlobalPipes(new ZodValidationPipe());
  app.enableCors({
    origin: frontendUrl
      ? frontendUrl.split(",").map((origin) => origin.trim())
      : true,
    credentials: true,
  });

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();

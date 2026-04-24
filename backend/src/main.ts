import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { ZodValidationPipe, patchNestJsSwagger } from "nestjs-zod";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {

  patchNestJsSwagger();

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

  const swaggerApp = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Scala UVV - API')
    .setDescription('Serviço de agendamento de espaços UVV')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(swaggerApp, config);
  SwaggerModule.setup('/', swaggerApp, document);

  const swaggerPort = configService.get<number>("SWAGGER_PORT") || 4000;

  await swaggerApp.listen(swaggerPort);
  console.log(`📚 Swagger http://localhost:${swaggerPort}`);
}
bootstrap();

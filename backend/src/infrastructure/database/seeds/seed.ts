import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../../app.module';

async function seederGenerico() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  try {
    const filePath = path.join(__dirname, 'seeds.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    const seedData = JSON.parse(rawData);

    console.log('Mockando os dados para o banco...');

    // Itera em ordem os dados no arquivo json
    for (const [entityName, records] of Object.entries(seedData)) {
      
      // Procura a entidade registrada no damain
      const entityMetadata = dataSource.entityMetadatas.find(m => m.name === entityName);
      if (!entityMetadata) {
        console.warn(`Entidade ${entityName} não encontrada no TypeORM.`);
        continue;
      }

      const repository = dataSource.getRepository(entityMetadata.target);
      
      // Verifica se o banco ja esta populado
      const count = await repository.count();
      if (count > 0) {
        console.log(`⏭A tabela de ${entityName} já possui ${count} registros. `);
        continue; // Ignora a inserção dos dados para não sobrescrever eles
      }

      console.log(`Processando: ${entityName} (${(records as any[]).length} registros)`);

      const recordsToSave = [];

      for (const record of records as any[]) {
        // Se for a entidade 'Usuario' faz a criptografia da senha
        if (entityName === 'Usuario' && record.senhaHash) {
          record.senhaHash = await bcrypt.hash(record.senhaHash, 10);
        }
        recordsToSave.push(record);
      }

      // Salva os dados no banco
      await repository.save(recordsToSave);
    }

    console.log('Banco de dados populado com sucesso!');
  } catch (error) {
    console.error('Erro ao mockar os dados:', error);
  } finally {
    await app.close();
  }
}

seederGenerico();
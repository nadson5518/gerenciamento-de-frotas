import 'dotenv/config';
import app from './app.js';
import { checkDatabaseConnection } from './config/database.js';

const PORT = Number(process.env.PORT ?? 3333);

async function bootstrap() {
  try {
    await checkDatabaseConnection();
    console.log('✅ Database connected.');

    app.listen(PORT, () => {
      console.log(`🚚 Fleet API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

bootstrap();

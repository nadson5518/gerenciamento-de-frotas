import 'dotenv/config';
import app from './app.js';
import { checkDatabaseConnection } from './config/database.js';

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  try {
    await checkDatabaseConnection();
    console.log('Database connected.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Fleet API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:');
    console.error(error);
    process.exit(1);
  }
}

bootstrap();

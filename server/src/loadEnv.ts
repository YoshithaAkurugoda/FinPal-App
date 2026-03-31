import { existsSync } from 'fs';
import { resolve } from 'path';

import { config } from 'dotenv';

// Prefer server/.env when cwd is monorepo root (..../FinPal); else use cwd/.env (..../FinPal/server)
const nested = resolve(process.cwd(), 'server', '.env');
const local = resolve(process.cwd(), '.env');
const envPath = existsSync(nested) ? nested : local;
config({ path: envPath });

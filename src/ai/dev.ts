import { config } from 'dotenv';
config();

import '@/ai/flows/populate-college-info.ts';
import '@/ai/flows/estimate-acceptance-rate.ts';
import '@/ai/flows/list-majors.ts';
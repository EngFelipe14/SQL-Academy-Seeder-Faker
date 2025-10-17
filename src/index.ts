import { minimalSeedConfig } from './config/seedConfig/seedConfig.ts';
import { populateDatabase } from './scripts/populateDatabase.ts';
import { generateCSV } from './scripts/generateCSVs.ts';

populateDatabase(minimalSeedConfig);
generateCSV(minimalSeedConfig);
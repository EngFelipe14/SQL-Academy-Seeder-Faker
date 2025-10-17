import { standardSeedConfig } from './config/seedConfig/seedConfig.ts';
// import { populateDatabase } from './scripts/populateDatabase.ts';
import { generateCSV } from './scripts/generateCSVs.ts';

// populateDatabase(standardSeedConfig);
generateCSV(standardSeedConfig);


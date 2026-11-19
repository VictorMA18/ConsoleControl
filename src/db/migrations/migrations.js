import journal from './meta/_journal.json';
import m0000 from './0000_tense_lucky_pierre.sql';
import m0001 from './0001_rates_by_block.sql';
import m0002 from './0002_settlement_columns.sql';
import m0003 from './0003_payments.sql';
import m0004 from './0004_shifts.sql';
import m0005 from './0005_console_names.sql';
import m0006 from './0006_session_extensions.sql';
import m0007 from './0007_usage_minutes.sql';
import m0008 from './0008_maintenances.sql';
import m0009 from './0009_restore_ps3.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005,
m0006,
m0007,
m0008,
m0009
    }
  }
  
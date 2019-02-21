import { J5IO } from 'j5-io';
export interface IOptions {
    includePins?: Array<number | string>;
    excludePins?: Array<number | string>;
    enableSerial?: boolean;
    enableI2C?: boolean;
}
export declare function RaspiIO({ includePins, excludePins, enableSerial, enableI2C }?: IOptions): J5IO;

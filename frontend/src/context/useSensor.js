import { useContext } from 'react';
import SensorContext from './SensorContext';

export const useSensor = () => useContext(SensorContext);
export default useSensor;

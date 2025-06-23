import { Chart, registerables } from 'chart.js';

// Register all Chart.js components (scales, controllers, elements, etc.)
Chart.register(...registerables);

export default Chart; 
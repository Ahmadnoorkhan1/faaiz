import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';


const BarChart = () => {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend
    );

    const labels = ['1st Week', '2nd Week', '3rd Week', '4th Week', '5th Week', '6th Week'];

    const data = {
      labels,
      datasets: [
        {
          label: 'Project Progress',
          data: [180, 200, 20],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
        },
        
      ],
    }
    const options ={

    }
  return (
    // Lets make a bar chart please
    <div className=''>
        <Bar options={options} data={data} />
    </div>
  )
}

export default BarChart
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const Dashboard = () => {
    //state
    const navigate = useNavigate();

    //comportement
    const handleClick = (event) => {
        console.log("handleCLick test ok");
        const folderName = event.currentTarget.getAttribute("name");
        if(folderName) {
          navigate(`/${folderName}`);
        }};

    //affichage




    return (
        <div className='dashboard-container'>
             <h1>Welcome to lokkerroom</h1>

             <div className="dashboard-body">
                <div className="dashboard-body-element" onClick={handleClick} name ="Lobbys">
                    <img src="" alt="" />
                    <p>Lobbys</p>
                </div>

                <div className="dashboard-body-element" onClick={handleClick} name="newLobby">
                    <img src="" alt="" />
                    <p>New lobby</p>
                </div>
            </div>
        </div>
       
    )
  };
  
  export default Dashboard; // Export par défaut
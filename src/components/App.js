// Import components
import Map from './Map'
import { MenuButton } from './LayerMenu';
import { FilterButton } from './FilterMenu';
import { ToolsButton } from './ToolsMenu';

// Import CSS
import '../css/Map.css'
import '../css/LayerMenu.css'
import '../css/FilterMenu.css'
import '../css/ToolsMenu.css'
import '../css/Logo.css'
import 'tippy.js/dist/tippy.css'; 

function App() {

  // Render the App component
  return (
    <div className="App">
      <img id="geoportalLogo" src="/images/logo/geoportal_logo_no_background.PNG" alt="Geoportal Logo"></img>
      <Map />
      <MenuButton />
      <FilterButton />
      <ToolsButton />
    </div>
  );
}

export default App;

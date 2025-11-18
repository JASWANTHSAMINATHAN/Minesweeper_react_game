import Minesweeper from "./Minesweeper";
//inputing rows cols mines
export default function App() 
{
  return (
   <div className="app">
  <Minesweeper rows={9} cols={9} mines={10} />
  </div>

  );
}

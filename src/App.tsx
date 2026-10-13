import styled from "styled-components";
import Game from "./components/Game";

import "./App.css";
import Paint from "./components/Paint";
import { PAINT_MODE } from "./app/constants";

const StyledApp = styled.div`
  background: black;
  width: 100vw;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledScreen = styled.div`
  position: relative;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  background: black;
`;

const App = () => {
  return (
    <StyledApp>
      <StyledScreen>
        <Game />
        {PAINT_MODE && <Paint />}
      </StyledScreen>
    </StyledApp>
  );
};

export default App;

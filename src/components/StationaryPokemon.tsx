import styled from "styled-components";
import { StationaryPlacement } from "../maps/map-types";
import PixelImage from "../styles/PixelImage";
import { xToPx, yToPx } from "../app/position-helper";
import { getPokemonMetadata } from "../app/use-pokemon-metadata";

const StyledMon = styled.div<{ x: number; y: number }>`
  position: absolute;
  top: ${(props) => yToPx(props.y)};
  left: ${(props) => xToPx(props.x)};
  transform: translateY(-20%);
`;

const Sprite = styled(PixelImage)`
  width: ${xToPx(1)};
`;

const StationaryPokemon = ({ spot }: { spot: StationaryPlacement }) => {
  let src: string;
  try {
    src = getPokemonMetadata(spot.id).images.front;
  } catch {
    return null;
  }
  return (
    <StyledMon x={spot.pos.x} y={spot.pos.y}>
      <Sprite src={src} />
    </StyledMon>
  );
};

export default StationaryPokemon;
